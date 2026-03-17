# Conatus Real Estate Website

## Overview
Marketing website for Conatus Real Estate Inc. Built with Astro, deployed to Cloudflare Pages.
Design inspired by Banyan Studio theme (dark/minimal aesthetic, GSAP animation-ready) with
Case theme patterns for case study narrative structure.

## Architecture
- **Framework**: Astro 6.x with MDX support
- **Hosting**: Cloudflare Pages (deploy via GitHub Actions)
- **Domain**: conatusre.com
- **Content**: Astro Content Collections (MDX files in `src/content/`)
- **Styling**: Vanilla CSS with design tokens (no Tailwind)

## Content Structure

### Blog (`src/content/blog/*.mdx`)
Frontmatter schema:
```yaml
title: string (required)
description: string (required)
pubDate: date (required)
updatedDate: date (optional)
heroImage: string (optional, path relative to /images/)
category: string (default: "General")
tags: string[] (default: [])
draft: boolean (default: false)
```
Slug format: kebab-case, derived from filename (e.g., `my-post-title.mdx` → `/blog/my-post-title`)

### Case Studies (`src/content/case-studies/*.mdx`)
Frontmatter schema:
```yaml
title: string (required)
description: string (required)
pubDate: date (required)
heroImage: string (optional)
propertyType: string (required — e.g., "SFR Portfolio", "Affordable Housing")
market: string (required — e.g., "Southeast US", "Midwest US")
outcome: string (required — brief outcome summary)
tags: string[] (default: [])
draft: boolean (default: false)
```
Narrative structure: Problem → Process → Outcome (use h2 headings for each section)

### Services (`src/content/services/*.mdx`)
Frontmatter schema:
```yaml
title: string (required)
description: string (required)
icon: string (optional)
order: number (default: 0, controls display order)
draft: boolean (default: false)
```

## Content Guardrails

**CRITICAL**: NEVER use real client names, addresses, or specific deal amounts in any content.
All case studies MUST use anonymized data:
- Use geographic regions, not specific cities/addresses ("Southeast US", not "123 Main St, Atlanta")
- Use percentage improvements, not dollar amounts ("18% NOI improvement", not "$45,000 increase")
- Use descriptive titles, not client names ("Regional Investor", not "Acme Capital")
- No client-identifiable information in any file, including comments and commit messages

## Git Workflow

- **Push enabled**: Workers should commit and push after completing work
- All changes via pull request — no direct push to `main`
- Require 1 review before merge
- Branch naming: `feature/description`, `content/description`, `fix/description`
- After committing on a task branch, push with `git push -u origin <branch-name>`
- Proactively commit and push — don't wait to be asked

## Design Conventions

### Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0c0c0c` | Page background |
| `--color-bg-elevated` | `#141414` | Card/code backgrounds |
| `--color-bg-card` | `#1a1a1a` | Card surfaces |
| `--color-accent` | `#c8a96e` | Gold accent (links, highlights) |
| `--color-accent-hover` | `#d4ba82` | Accent hover state |
| `--color-text` | `#f5f0e8` | Primary text (warm off-white) |
| `--color-text-muted` | `#a0998e` | Secondary text |
| `--color-border` | `#2a2a2a` | Borders/dividers |

### Typography
- **Headings**: Geist / Inter (system fallback)
- **Body**: Inter / system-ui
- **Mono**: Geist Mono / SF Mono

### Component Patterns
- Cards use `.card` class with 12px border-radius, border hover effect
- Buttons use `.btn` with `--primary` (gold bg) and `--outline` (border) variants
- Section headers use `.section-header` with uppercase label + h2
- Content uses `.prose` wrapper for consistent typography

## Deployment

### Cloudflare Pages
- **Workflow**: `.github/workflows/deploy.yml`
- **Build**: `npm run build` → `dist/`
- **Triggers**: Push to `main` (production), PRs get preview deployments
- **Secrets required**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Domain**: conatusre.com (custom domain via Cloudflare Pages)
- **Analytics**: Cloudflare Web Analytics (snippet in `src/layouts/Base.astro`)
- **Redirects**: `public/_redirects` (Cloudflare Pages format)

### Claude Code Action (Orchestrator)
- **Workflow**: `.github/workflows/claude-pr.yml`
- **Triggers**: Issues labeled `claude`, issue comments on `claude`-labeled issues, PR review comments
- **How it works**: When a GitHub issue is created with the `claude` label, Claude Code Action automatically picks it up, implements the request, and opens a PR
- **Secrets required**: `ANTHROPIC_API_KEY`
- **Usage**: Create a GitHub issue with the `claude` label and describe the content change or feature needed

## Build & Dev
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Images
Place images in `public/images/`. Reference as `/images/filename.ext` in frontmatter and content.
