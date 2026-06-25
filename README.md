# Project Overview
CodingDatafy is an open-source documentation engine and knowledge base dedicated to coding languages. This specific repository hosts the centralized, flat-file dataset of technical data. The platform is engineered to solve the challenge of fragmented coding references by providing a centralized, high-performance, and scalable repository of content.

## Technical Stack
- Domain Name: [www.codingdatafy.com](https://www.codingdatafy.com)
- Content Format: Markdown (.md) with structured YAML Front Matter
- Architecture: Decoupled Flat-file Dataset (No Database)
- Automation & CI/CD: GitHub Actions (Automated Webhooks to Core Engine)

## Architecture Overview
Adopting a "Content-as-Code" philosophy and powered by an AI-First Approach, this repository organizes technical documentation in structured Markdown formats. By utilizing a flat-file architecture instead of traditional databases, CodingDatafy achieves near-instantaneous load times, superior SEO semantic indexing, and a streamlined contribution workflow that allows developers to manage technical content via Git.

The dataset is optimized to run alongside our core web engine (**`centroidium`**). When updates are pushed here, an automated GitHub Actions workflow triggers the engine to pull the new data and deploy it seamlessly on Vercel, entirely avoiding manual rebuilds and preserving free-tier resource limits.

## Branching Model
We follow a strict branching model to ensure production stability:
- **main**: Reserved for stable production releases only. Pushes here trigger live data deployment.
- **develop**: The primary integration branch for all new features and content. Pushes here trigger preview testing.
- **feature/**: All work must be performed on a dedicated feature branch created from 'develop' (e.g., `feature/add-python-docs`).

## Contribution Policy
CodingDatafy is built for the global developer community. We follow a professional workflow where every content change or documentation extension is linked to a specific Issue and tracked within our Project Management board on GitHub.

## Licensing
This repository governs only the documentation and technical data assets:

- **Documentation & Content:** All content within the `/data` directory is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) license.
- **Repository Configuration:** Administrative scripts and CI/CD workflows are licensed under the [MIT License](LICENSE).

Under this model, you are free to share and adapt the material for any purpose, even commercially, provided that you give **appropriate credit** to CodingDatafy Organization and distribute your contributions under the same license.

Copyright (c) 2026 CodingDatafy Organization.