# CIR-18: POS/Instacart Reconciliation Research

**Date:** 2026-02-08
**Status:** Complete
**Epic:** [CIR-18](https://2linessoftware.atlassian.net/browse/CIR-18)

---

## Executive Summary

This research evaluates technical approaches for reconciling POS data with third-party delivery platform data (Instacart, DoorDash) for grocery retailers. The primary use case is Neiman's (~$450k/month Instacart, ~$150k/month DoorDash across 141 stores).

**Key Findings:**

1. **Entity Resolution Framework**: **Splink** is the recommended open-source framework. It uses Fellegi-Sunter probabilistic matching with unsupervised learning (no labeled training data needed), runs 1M records in ~2 minutes on DuckDB, and is production-proven at UK Ministry of Justice.

2. **Vector Search Infrastructure**: **FAISS** for proof-of-concept (fastest, free), **Pinecone** for production (managed, p95 ~40-50ms). Neiman's 600K transactions/month is easily handled in-memory on a single server.

3. **Substitution Detection**: Instacart's API provides line-item detail including original UPC, replacement UPC, and substitution status. Deep Sets architecture can create permutation-invariant basket embeddings where substituted items produce similar (not identical) vectors.

4. **1099-K Requirements**: Threshold reverted to $20,000 + 200 transactions under OBBBA. Filing deadline for 2025 tax year is February 2, 2026 (payee copies) / March 31, 2026 (e-filing). Reconciliation need exists regardless of threshold.

5. **Commercial Landscape**: Existing solutions (DeliverSense, IQ BackOffice) focus on restaurants with ~20% recovery claims. **Grocery vertical is underserved** - unique challenges around substitutions and weighted items are not addressed.

---

## Recommended Technical Approach

### Hybrid Two-Phase Architecture

**Phase 1: Splink Probabilistic Matching**
- Blocking by store_id + date (reduces comparisons by 99%+)
- Compare: amount (fuzzy), timestamp (window), item_count
- High confidence (>0.95) auto-matches
- Expected: 70-80% transactions resolved

**Phase 2: Vector Similarity for Uncertain Cases**
- Deep Sets basket embeddings (permutation-invariant)
- FAISS ANN search for similar baskets
- Substitution-aware scoring with explanations
- Handles remaining 20-30% of transactions

### Technology Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Entity Resolution | Splink + DuckDB | Unsupervised, fast, proven |
| Vector Search | FAISS (PoC) / Pinecone (Prod) | Performance vs. operational simplicity |
| Data Warehouse | BigQuery (existing) | Already in place |
| Embeddings | PyTorch + Deep Sets | Permutation-invariant for baskets |

---

## Entity Resolution Tools

### Comparison

| Tool | Approach | Training Data | Performance | Best For |
|------|----------|---------------|-------------|----------|
| **Splink** | Fellegi-Sunter probabilistic | Unsupervised | 1M in ~2 min | Cold-start, high volume |
| **Zingg** | Active learning | Requires labeling | 0.05-1% of space | Accuracy optimization |
| **Dedupe.io** | Active learning | Requires labeling | Medium scale | Simple deduplication |

### Splink (Recommended)

**Why Splink wins for this use case:**

1. **No training data needed** - Uses Fellegi-Sunter probabilistic model with expectation-maximization. Critical for cold-start with new clients.

2. **Excellent performance** - DuckDB backend handles 1M records in ~2 minutes. Neiman's ~600K transactions/month is easily manageable.

3. **Blocking strategies** - Built-in support for blocking rules to reduce comparison space. Store_id + date blocking would reduce comparisons by 99%+.

4. **Production-proven** - Used by UK Ministry of Justice for large-scale record linkage.

5. **Python-native** - Integrates with existing BigQuery/Jupyter infrastructure.

```python
# Example Splink configuration for transaction matching
from splink import DuckDBAPI, Linker, SettingsCreator, block_on
import splink.comparison_library as cl

settings = SettingsCreator(
    link_type="link_only",
    comparisons=[
        cl.ExactMatch("store_id"),
        cl.AbsoluteTimeDifferenceAtThresholds("timestamp", [60, 300, 900]),  # seconds
        cl.PercentageDifferenceAtThresholds("amount", [0.01, 0.05, 0.10]),
        cl.ExactMatch("item_count"),
    ],
    blocking_rules_to_generate_predictions=[
        block_on("store_id", "transaction_date"),
    ],
)
```

### Zingg

- Active learning approach - requires human labeling of sample pairs
- Good for accuracy optimization after initial deployment
- Could be used as Phase 2 refinement after Splink baseline

### Dedupe.io

- Commercial with open-source core
- Similar active learning approach to Zingg
- Better suited for simpler deduplication than cross-system matching

---

## Vector Search Infrastructure

### Comparison

| Solution | Type | Performance | Cost | Best For |
|----------|------|-------------|------|----------|
| **FAISS** | Library | Fastest (millions QPS) | Free | PoC, research, self-managed |
| **Pinecone** | Managed | p95 ~40-50ms | $70/mo starter | Production, low ops burden |
| **Weaviate** | Self-hosted/Cloud | Good hybrid search | Variable | Metadata-heavy queries |
| **ScaNN** | Library | Near-FAISS speed | Free | TensorFlow integration |

### FAISS (Recommended for PoC)

- Facebook's battle-tested vector similarity library
- Supports multiple index types (Flat, IVF, HNSW)
- In-memory for fastest performance
- Neiman's scale (600K transactions/month) fits easily in RAM

```python
import faiss
import numpy as np

# Build index
dimension = 128  # embedding dimension
index = faiss.IndexFlatL2(dimension)  # Exact search for PoC
# Or: index = faiss.IndexIVFFlat(quantizer, dimension, nlist)  # Approximate

# Add vectors
index.add(pos_embeddings)

# Search
k = 5  # top-k matches
distances, indices = index.search(instacart_embeddings, k)
```

### Pinecone (Recommended for Production)

- Fully managed - no infrastructure to maintain
- Consistent p95 latency ~40-50ms
- Built-in metadata filtering (store_id, date range)
- Hybrid search combining vector + metadata

### Scale Considerations

For Neiman's volume:
- ~600K transactions/month across both systems
- ~1.2M vectors to index
- Easily fits in single-server FAISS deployment
- Pinecone starter tier sufficient for production

---

## Substitution Detection

### How Instacart Handles Substitutions

Instacart's Connect API provides detailed line-item information:

```json
{
  "order_items": [
    {
      "line_num": "1",
      "qty": 1,
      "upc": "0001234567890",  // Original requested item
      "replacement_upc": "0009876543210",  // What was actually picked
      "item_status": "substituted",  // Status: found, substituted, refunded
      "original_item": {
        "name": "Brand Name Cereal 12oz",
        "price": 4.99
      },
      "replacement_item": {
        "name": "Store Brand Cereal 12oz",
        "price": 3.99
      }
    }
  ]
}
```

**Key fields for reconciliation:**
- `upc` vs `replacement_upc` - Identifies substitution
- `item_status` - Distinguishes found/substituted/refunded
- Price differences between original and replacement

### Embedding Approach for Substitutions

**Deep Sets Architecture:**

The challenge: baskets are unordered sets of variable length. A transaction with `{milk, bread, eggs}` should match `{eggs, bread, milk}` exactly, and should be *close to* `{milk, bread, egg substitute}`.

Deep Sets (Zaheer et al., 2017) solves this with permutation-invariant aggregation:

```python
import torch
import torch.nn as nn

class BasketEncoder(nn.Module):
    def __init__(self, item_embed_dim, basket_embed_dim):
        super().__init__()
        # Individual item embedding
        self.item_encoder = nn.Sequential(
            nn.Linear(item_embed_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64)
        )
        # Aggregation to basket-level
        self.basket_encoder = nn.Sequential(
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, basket_embed_dim)
        )

    def forward(self, item_embeddings):
        # item_embeddings: [batch, num_items, item_embed_dim]
        encoded = self.item_encoder(item_embeddings)  # [batch, num_items, 64]
        pooled = encoded.sum(dim=1)  # Permutation-invariant sum
        return self.basket_encoder(pooled)  # [batch, basket_embed_dim]
```

**Substitution-aware training:**
- Train with contrastive loss on matched pairs
- Substituted baskets should have small (non-zero) distance
- Completely different baskets should have large distance

---

## 1099-K Requirements

### Current Thresholds (2024-2025)

The IRS reporting threshold history:
- **Pre-2022**: $20,000 AND 200+ transactions
- **2022 proposal**: $600 (delayed)
- **2023-2024**: $5,000 transitional
- **2025 (OBBBA)**: Reverted to $20,000 AND 200+ transactions

Under the One Big Beautiful Bill Act (OBBBA), the threshold has been permanently set back to the original $20,000 + 200 transactions.

### Filing Deadlines

For 2025 tax year (filed in 2026):
- **January 31, 2026**: Platforms must furnish 1099-K to payees (merchants)
- **February 28, 2026**: Paper filing deadline to IRS
- **March 31, 2026**: Electronic filing deadline to IRS

### Reconciliation Implications

Even with higher thresholds:
1. **Most grocery retailers still exceed threshold** - Neiman's $450k/month Instacart alone far exceeds $20K
2. **C-Corp complexity** - 1099-K blends with credit card processing (Fiserv)
3. **Audit risk** - Unreconciled amounts create IRS exposure
4. **Cash flow impact** - Unrecovered discrepancies are lost revenue

---

## Competitive Landscape

### Existing Solutions

| Company | Focus | Approach | Claims |
|---------|-------|----------|--------|
| **DeliverSense** | Restaurants | Rule-based matching + manual review | "20% average recovery" |
| **IQ BackOffice** | Restaurants | Commission auditing | Full-service outsource |
| **Omnivore** | POS integration | API aggregation | No reconciliation focus |
| **Restaurant365** | Restaurant ops | Accounting integration | Basic matching |

### Gap Analysis

**Why grocery is underserved:**

1. **Substitution complexity** - Restaurants don't have substitutions; grocery does
2. **SKU volume** - Restaurants have 50-200 items; grocers have 30,000+
3. **Weight-based items** - Deli, produce, meat priced by weight
4. **Multi-platform** - Instacart, DoorDash, Uber Eats, Shipt all different
5. **Scale** - Higher transaction volumes than restaurants

**Competitive advantage opportunity:**
- ML-based matching handles messiness rules can't
- Substitution detection differentiator
- Grocery-specific domain knowledge

---

## Next Steps

### Proof of Concept Plan

1. **Validate data access** (Week 1)
   - Confirm line-item detail available from Instacart Connect API
   - Verify DoorDash data format and granularity
   - Get sample POS export from client

2. **Set up Splink PoC** (Week 2)
   - Basic matching on 1 month sample data
   - Tune blocking rules and comparison weights
   - Measure match rate and confidence distribution

3. **Build product taxonomy** (Week 2-3)
   - UPC to category mapping for substitution detection
   - Identify common substitution patterns (brand → store brand)
   - Create item embedding approach

4. **Define thresholds** (Week 3)
   - Client input on auto-match confidence threshold
   - Review queue criteria
   - Exception handling rules

5. **Prototype reports** (Week 4)
   - Sample discrepancy output format
   - Evidence packet for dispute submission
   - Executive summary dashboard

6. **Estimate recovery** (Week 4)
   - Analyze sample data for discrepancy frequency
   - Project recoverable amounts
   - Build ROI case for full deployment

---

## Sources

- [Splink Documentation](https://moj-analytical-services.github.io/splink/) - Entity resolution framework
- [Splink GitHub](https://github.com/moj-analytical-services/splink) - Source and examples
- [Zingg](https://www.zingg.ai/) - Active learning entity resolution
- [FAISS Wiki](https://github.com/facebookresearch/faiss/wiki) - Vector similarity search
- [Pinecone Documentation](https://docs.pinecone.io/) - Managed vector database
- [Instacart Connect API](https://docs.instacart.com/connect/api/) - Order and item data
- [IRS 1099-K FAQs](https://www.irs.gov/newsroom/form-1099-k-faqs) - Reporting requirements
- [DeliverSense](https://deliversense.com/) - Competitive solution
- [Deep Sets Paper](https://arxiv.org/abs/1703.06114) - Zaheer et al., 2017
- [Background Research](./reconcilliation_background.md) - Initial analysis
