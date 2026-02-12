# Templates

This directory contains Jinja/Nunjucks templates for rendering markdown content to HTML, PDF, and other formats.

## Quick Start

Use the `/export-to-html` skill to render markdown files:

```
/export-to-html path/to/document.md --title "My Document" --client "Acme"
```

See `.claude/skills/export-to-html/SKILL.md` for full documentation.

## Template Sets

| Directory | Purpose |
|-----------|---------|
| `2lines-external/` | External-facing documents (proposals, reports, deliverables) |

## Usage

Templates are designed to receive rendered markdown content plus metadata variables.

### Basic Flow

```
markdown source → markdown parser → jinja template → html output → (optional) pdf
```

### Variables

Each template set documents its expected variables. Common variables include:

- `title` - Document title
- `subtitle` - Document subtitle or description
- `content` - Rendered markdown content (HTML)
- `date` - Document date (e.g., "February 2026")
- `author` - Author name
- `client` - Client name (for client-facing docs)
- `version` - Document version (e.g., "1.0")
- `classification` - Classification level (e.g., "Confidential")

### Example Rendering (Python/Jinja2)

```python
import markdown
from jinja2 import Environment, FileSystemLoader

# Setup
env = Environment(loader=FileSystemLoader('_templates/2lines-external'))
template = env.get_template('base.html')

# Load and convert markdown
with open('source.md') as f:
    md_content = f.read()

html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

# Render
output = template.render(
    title='Project Proposal',
    subtitle='Phase 1 Implementation Plan',
    content=html_content,
    date='February 2026',
    author='John Carpenter, 2Lines Software',
    client='Acme Corp',
    version='1.0',
    classification='Confidential'
)

# Save
with open('output.html', 'w') as f:
    f.write(output)
```

### Example Rendering (Node.js/Nunjucks)

```javascript
const nunjucks = require('nunjucks');
const marked = require('marked');
const fs = require('fs');

// Setup
nunjucks.configure('_templates/2lines-external');

// Load and convert markdown
const mdContent = fs.readFileSync('source.md', 'utf8');
const htmlContent = marked.parse(mdContent);

// Render
const output = nunjucks.render('base.html', {
    title: 'Project Proposal',
    subtitle: 'Phase 1 Implementation Plan',
    content: htmlContent,
    date: 'February 2026',
    author: 'John Carpenter, 2Lines Software',
    client: 'Acme Corp',
    version: '1.0',
    classification: 'Confidential'
});

// Save
fs.writeFileSync('output.html', output);
```

## Adding New Template Sets

1. Create a new directory under `_templates/`
2. Include at minimum:
   - `base.html` - Main template with document structure
   - `style.css` - Stylesheet (linked from base.html)
   - `logo.svg` - Brand logo (optional)
3. Document expected variables in template comments
4. Update this INDEX.md with the new template set

## PDF Generation

For PDF output, use a tool like:
- **WeasyPrint** (Python) - Excellent CSS support
- **Puppeteer** (Node.js) - Chrome-based rendering
- **Prince** - Commercial, best print CSS support

The templates include `@media print` styles optimized for PDF generation.
