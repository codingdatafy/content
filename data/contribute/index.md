---
project: CodingDatafy
license: CC BY-SA 4.0
copyright: 2026 CodingDatafy Organization
author: CodingDatafy Team
title: "Contribute"
style: "rootpage.css"
breadcrumb: Contribute
id: "contribute-rootpage"
description: "Join CodingDatafy's global open-source mission. Learn our native Cloudflare Edge workflow to contribute structured Markdown content directly via GitHub."
---

## Contribution Guide

Thank you for your interest in **CodingDatafy**! On a mission to build the world's largest reference and knowledge base for coding, we rely on the collective expertise of the global developer community. 

As a professional engineering organization, we follow a structured, edge-first workflow to maintain high standards of speed, security, and accessibility.

## How You Can Contribute

### 1. Documenting Languages & References
Help us expand our reference base across our target categories (Languages, Frameworks, APIs, Databases, and Tools). You can contribute by:
- Adding missing coding language guides and reference pages.
- Refining syntax guides, compatibility profiles, and technical details.
- Updating reference data backed by verified primary documentation.

### 2. Improving the Core
If you are a **TypeScript** or **Cloudflare Edge** engineer, you can help optimize our stateless engine architecture:
- Enhancing edge performance, caching policies, and native `workerd` execution.
- Refining our Markdown parsing engine and R2 storage integration.
- Improving accessibility, responsive styles, and user interface components.

## Our Engineering Workflow
To maintain platform stability, we follow a strict **Feature-Branch Workflow**:

1. **Fork & Sync**: Fork the repository and ensure your local `develop` branch is up to date.
2. **Feature Branches**: Create a descriptive branch from `develop` for your task:
   - Format: `<type>(<scope>): <description> #issue-number` (e.g., `feature/44-html-guide`).
3. **Pull Request to Develop**: Submit your Pull Request to the **`develop`** branch.
   - Every pull request must link to an existing issue.
   - Automated GitHub Actions validate static builds and markdown schemas.
   - Maintainers will review and verify your changes.
4. **Integration**: Once approved, `develop` is merged into **`main`**, triggering automated Wrangler deployment to Cloudflare Workers and syncing content to Cloudflare R2 storage.

> **Note**: Direct pushes to `develop` or `main` are restricted to protect the production environment.

## Content Standards
To maintain the integrity of our reference base, all contributions must adhere to these standards:

- **Source Reliability**: We strictly accept information derived from **Official Documentation** (e.g., W3C, ISO standards, or official language maintainers). Tutorials or secondary blog posts are not accepted as primary references.
- **Language Policy**: English is required for all source code, comments, and markdown content.
- **Verifiability**: Every technical claim or language specification must be verifiable against official documentation.

### Documentation Standards
- **Source Code (TypeScript / CSS):** Every file must include the standard `@project` header comment at the top.
- **Content Files (MD):** Every Markdown file must include a standardized **Frontmatter** block at the very top to ensure metadata integrity, layout assignment, and copyright compliance.