# Contributing to CodingDatafy - Content & Data
Thank you for your interest in contributing to CodingDatafy website. To maintain data integrity and professional standards across our flat-file dataset, please follow these guidelines.

## Content Workflow

### 1. Issue First Policy
Every content contribution must address an existing Issue or a newly created one. This ensures that documentation efforts are not duplicated and align with the project roadmap.

### 2. Branching Strategy
We follow a strict branching model to ensure production stability:
- **main**: Reserved for stable production releases only. Merges here trigger live production data builds.
- **develop**: The primary integration branch for all new content. Pushes here trigger preview testing.
- **feature/**: All work must be performed on a dedicated feature branch created from 'develop' (e.g., `feature/add-python-docs`).

### 3. Commit Convention
Use professional English for commit messages. All commits must follow our structured syntax and link to an issue number.
Example: `docs(languages): implement core syntax guidelines for Rust #102`

## Submission Process

### Step 1: Fork and Branch
- Fork the content repository and create your feature branch from the **develop** branch.

### Step 2: Implementation
- Ensure all content is written in professional technical English.
- Add the standard organizational YAML Frontmatter header to every new Markdown file.

### Step 3: Quality Assurance
- Push your changes to your fork.
- Verify the layout and deployment through the Vercel Preview URL provided in the Pull Request automated build.

### Step 4: Pull Request (PR)
- Submit a Pull Request from your feature branch to the CodingDatafy content **develop** branch.
- PRs must include a detailed description of the documentation changes and link to the relevant Issue.
- Once the PR is approved and merged into 'develop', it will be staged for the next release to 'main'.

## Content Standards

### Metadata Integrity (Frontmatter)
Every Markdown file within this repository must include a standardized **Frontmatter** block at the very top to ensure metadata integrity, layout assignment, and copyright protection:

```markdown
---
project: CodingDatafy
license: CC BY-SA 4.0
copyright: 2026 CodingDatafy Organization
author: CodingDatafy Team
title: "Page Title Here"
style: "CSS-Style Here"
description: "A brief professional description for SEO purposes"
---