# Cloud Doctor MCP

An MCP (Model Context Protocol) server that provides Azure cloud cost monitoring tools.

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Go 1.24+ (for building from source)

## Configuration

The server requires the `AZURE_SUBSCRIPTION_ID` environment variable to be set.

### Finding Your Subscription ID

```bash
az account list --output table
```

### Setting Up

1. Edit `.mcp.json` in the knowledge-base root directory
2. Set your Azure subscription ID:

```json
{
  "mcpServers": {
    "cloud-doctor": {
      "command": "./mcp/cloud-doctor-mcp/cloud-doctor-mcp",
      "env": {
        "AZURE_SUBSCRIPTION_ID": "your-subscription-id-here"
      }
    }
  }
}
```

## Available Tools

### azure_get_subscription_info

Get Azure subscription information including ID, display name, and state.

### azure_get_current_month_costs

Get Azure costs for the current month, broken down by service.

### azure_get_cost_comparison

Compare Azure costs between current month and last month (same period). Returns:
- Current month costs by service
- Last month costs by service
- Dollar difference
- Percentage change

### azure_get_cost_trend

Get Azure cost trend for the last 6 months with summary statistics including:
- Total spend over 6 months
- Average monthly spend
- Highest/lowest spending months

## Authentication

The server uses Azure's DefaultAzureCredential which supports:
- Azure CLI (`az login`)
- Environment variables (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`)
- Managed Identity (when running on Azure)

## Building from Source

```bash
cd mcp/cloud-doctor-mcp
go build -o cloud-doctor-mcp .
```

## Required Azure Permissions

The authenticated user/service principal needs:
- `Cost Management Reader` role on the subscription
- `Reader` role on the subscription (for subscription info)
