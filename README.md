# Project Overview
CodingDatafy is an open-source documentation engine and knowledge base dedicated to coding. This specific repository hosts the centralized, flat-file dataset of technical data. The platform is engineered to solve the challenge of fragmented coding references by providing a centralized, high-performance, and scalable repository of content.

## Technical Stack & Architecture
- **Domain Name:** [www.codingdatafy.com](https://www.codingdatafy.com)
- **Content Format:** Markdown (`.md`) with structured YAML Front Matter
- **Storage Layer:** Cloudflare R2 (Stateless, object-based storage bucket `codingdatafy-content-r2`)
- **Rendering Engine:** Cloudflare Native (`workerd` runtime, zero-dependency engine core via `centroidium` repository)
- **Edge Performance:** Cloudflare Cache API (Global edge caching) & Cloudflare Workers Analytics Engine
- **Automation & CI/CD:** GitHub Actions (Direct R2 bucket synchronization via `r2-sync.yml`)

## Branching Model & Workflow
We follow a strict, protected branching model to ensure production stability:
* **`main`**: Reserved for stable production releases only. Fully protected. Pushes to the `/data` directory automatically sync raw markdown objects directly to the production R2 bucket.
* **`develop`**: The primary integration branch for all new features and content updates. Fully protected except for verified administrative modifications.

All commits must follow our standard commit syntax: `<type>(<scope>): <description> #issuenumber` (e.g., `docs(languages): update array methods #27`).

## Contribution Policy
CodingDatafy is built for the global developer community. We follow an enterprise-grade workflow where every content change or documentation extension is strictly linked to a specific **Issue** and tracked within our dedicated **Project Management** board on GitHub. Anyone on GitHub is welcome and encouraged to contribute to our repositories.

## Licensing
This repository governs only the documentation and technical data assets:

* **Documentation & Content:** All content within the `/data` directory is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) license.
* **Repository Configuration:** Administrative scripts and CI/CD workflows are licensed under the [MIT License](LICENSE).

Under this model, you are free to share and adapt the material for any purpose, even commercially, provided that you give **appropriate credit** to **CodingDatafy Organization** and distribute your contributions under the same license.