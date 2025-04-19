# PLANNING - Veltis Protocol Project

## 1. High-Level Vision & Goals

* **Vision:** To become the trusted standard for creating verifiable proof of existence and managing the provenance of R&D assets globally, starting from Mexico.
* **Goal (MVP):** Launch a functional, secure, and user-friendly micro-SaaS platform allowing individual researchers and small startups to easily timestamp digital R&D files on the blockchain (Polygon PoS) and manage associated IP-NFT records.
* **Core Purpose Alignment:** Directly supports improving R&D efficiency by streamlining documentation, reducing disputes over timing/integrity, enhancing trust in data, and facilitating secure sharing for collaboration and due diligence, thereby potentially catalyzing innovation, including in LATAM.

## 2. Target Users (MVP)

* **Primary:** Individual academic researchers (PhD students, postdocs, professors), small R&D teams in tech startups (especially deep tech/biotech).
* **Secondary:** University TTO staff (for simplified disclosure management), freelance inventors/creators.
* **Location:** Global, with initial marketing focus potentially on Mexico/LATAM tech/research hubs (e.g., Jalisco, Mexico City, São Paulo, Bogotá) leveraging local context and network, alongside global online communities.

## 3. Core Value Proposition

* **Simple:** Easy-to-use interface requiring no blockchain expertise.
* **Secure:** Immutable proof using public blockchain; encrypted off-chain storage; user-controlled access.
* **Verifiable:** Publicly verifiable timestamps and proof-of-existence via blockchain explorers.
* **Affordable:** Freemium model with low-cost paid tiers suitable for academia and early-stage startups.
* **R&D Focused:** Tailored workflow for managing research data, disclosures, milestones, and IP documentation.

## 4. Subscription Tiers & Monetization (Revised Plan)

This section outlines the planned feature breakdown by subscription tier, incorporating revised limits and features. Implementation will occur post-MVP.

### Tier 1: Innovator (Free)

*   **Target Audience:** Individual researchers, students, ideators needing basic proof-of-concept.
*   **Price:** $0
*   **Features:**
    *   IPNFT Minting: Up to **5 IPNFTs per account lifetime**.
    *   Storage: **100 MB** decentralized storage (IPFS).
    *   Core Functionality: Basic proof-of-existence verification, access to public verification tools, dashboard view, certificate download.
    *   Support: Community forum access.
*   **Rationale:** A true trial/exploration tier. Sufficient to understand the process for a few key early ideas, pushing active users to upgrade.
*   **Implementation Notes:** Requires tracking lifetime mint count and total storage used per user (or per default single-user team).

### Tier 2: Startup

*   **Target Audience:** Early-stage tech/biotech startups, active research teams (<10 people) needing regular IP protection and basic collaboration.
*   **Price:** **$299 USD / month** (includes up to 10 users).
*   **Additional Users:** +$15 USD / user / month.
*   **Features (Includes Innovator features, plus):**
    *   IPNFT Minting: **50 IPNFTs per month** base allowance (+5 per additional user).
    *   Storage: **100 GB** decentralized storage (IPFS) base allowance (+10 GB per additional user).
    *   Versioning: Track asset history and link versions.
    *   Basic Access Control: Manage private/public asset settings, simple link-based sharing.
    *   Basic API Access.
    *   Team Functionality: Invite/manage up to base user limit, basic roles.
    *   Support: Standard email and chat support.
*   **Rationale:** Priced based on value for protecting crucial startup IP. Allows regular protection of significant developments.
*   **Implementation Notes:** Requires team structures, subscription management (Stripe), monthly usage tracking (mints & storage), versioning logic, basic sharing link mechanism, basic API key system.

### Tier 3: Institution

*   **Target Audience:** Universities, Technology Transfer Offices (TTOs), larger corporate R&D departments, government research agencies.
*   **Price:** Starting at **$15,000 USD / year** ($1,250 / month) (includes up to 500 users). Custom pricing available.
*   **Features (Includes Startup features, plus):**
    *   IPNFT Minting: Up to **500 IPNFTs per month** base allowance (Customizable).
    *   Storage: **1 TB+** base decentralized storage (IPFS, optional Arweave) + custom allocation.
    *   Advanced Collaboration & Access Control: Full Lit Protocol integration.
    *   Audit Trails & Compliance Reporting.
    *   Advanced Team & User Management (departments, roles, permissions).
    *   Support: Priority support, dedicated account management, SLAs.
    *   Integration Capabilities: Custom API integrations.
    *   (Optional) Institutional Verification Badge.
*   **Rationale:** Provides ample capacity and features for institutional needs, compliance, and integration.
*   **Implementation Notes:** Requires significant additions: Lit Protocol integration, robust audit logging (potentially anchored), advanced RBAC, scalable architecture, dedicated support infrastructure.

---

## 5. Architecture (Revised for Fractionalization)

* **Model:** Micro-SaaS (starting with core notarization service, evolving towards fractionalization).
* **Platform:** Web Application (responsive design).
* **Blockchain Interaction:**
    *   **IPNFT Minting (User-Driven):** The user initiates the minting process directly from the frontend using their connected wallet (e.g., Metamask). The backend prepares the necessary metadata URI (linking to file hash and IPFS CID on Pinata), which is then passed to the frontend. The frontend prompts the user to sign and send the minting transaction to the core **ERC721** IPNFT contract on Polygon PoS.
    *   **Fractionalization (Phase 2+):** Backend integration with an external fractionalization protocol (e.g., Tessera) to lock the ERC721 IPNFT and issue standard ERC20 tokens representing shares. User initiates via frontend.
    *   **User Wallet:** Essential for the MVP minting process. Users connect their wallet (Metamask) to sign transactions and receive their minted IPNFTs directly. Future phases might involve wallet connection for managing fractional tokens or interacting with DeFi.
* **Data Storage:** User metadata, IPNFT details, and record pointers stored in Supabase (PostgreSQL). R&D files stored on decentralized storage (IPFS via Pinata). Hashes/key data stored on blockchain via the ERC721 token's metadata URI.
* **Access Control:** (MVP: Placeholders Only) Future integration planned with Lit Protocol for granular access control to underlying files, potentially linked to ERC721 ownership or fractional token ownership.

## 6. Tech Stack (Revised)

* **Blockchain:** Polygon PoS (MVP), explore other L2s/chains later.
* **Smart Contracts:**
    *   **Core IPNFT:** Solidity, **ERC721** standard (upgradeable via UUPS recommended), OpenZeppelin libraries. Will include a public `safeMint(to_address, token_uri)` function callable by users via the frontend.
    *   **Fractionalization (Integration):** Interact with external protocol contracts (e.g., Tessera Vault Factory). No custom fractionalization contracts initially.
* **Decentralized Storage:** IPFS (via Pinata), potentially Arweave.
* **Access Control:** Lit Protocol (or investigate alternatives).
* **Frontend:** React / Next.js (or Vue/Nuxt). Framework like Tailwind CSS.
* **Backend:** Node.js / Express (minimal, for potential future APIs).
* **Database:** Supabase (PostgreSQL managed via Supabase).
* **Web3 Libraries:** ethers.js (or web3.js / viem).
* **Hosting:** Vercel/Netlify (Frontend), Supabase (DB/Auth), Railway/Render (Optional Backend).
* **Authentication:** Supabase Auth.
* **UI Components:** Shadcn UI (using Radix UI primitives).
* **Icons:** Lucide React.
* **Payment Processor:** Stripe (planned).

## 7. UI/UX Design (MVP & Beyond)

*   **Style:** Modern, clean, professional, tech/science-inspired aesthetic (ref: BioVista example). Light/dark mode support via Tailwind CSS and Shadcn UI theming.
*   **Layout:** Use of cards (`.bio-card`), rounded elements, ample whitespace. Responsive design using Tailwind breakpoints.
*   **Landing Page (`/`):**
    *   Serves as the main entry point and functional hub.
    *   Includes Header, Hero (with specific tagline/image), Feature Cards, Tokenization Section (conditional), Footer.
    *   **Tokenization Section:** Displays login/signup prompt if logged out. If logged in, displays the core file upload/timestamping interface (`FileUploadComponent`).
*   **Dashboard Page (`/dashboard`):** Displays a table of the user's timestamped assets/IP records.
*   **Login Page (`/login`):** Uses Supabase Auth UI component for login/signup.
*   **(Phase 2+) Pricing Page (`/pricing`):** Displays subscription tiers.
*   **(Phase 2+) Account/Billing Page (`/account/billing`):** Shows current plan, links to Stripe portal.
*   **(Phase 2+) Team Management UI:** Interface for inviting/managing team members and roles.
*   **(Phase 3+) Advanced UI:** Audit Log viewer, API key management, Lit Protocol condition builder.

## 8. Tools

* **AI Coding Assistants:** Cursor, Cline, GitHub Copilot (for development acceleration).
* **Version Control:** Git / GitHub.
* **Project Management:** Use `TASK.md` initially, potentially move to Trello/Jira/Notion later.
* **CI/CD:** GitHub Actions (or similar).
* **Testing:** Vitest (Node.js backend & React/Next.js frontend), React Testing Library (frontend components).
* **Blockchain Explorer:** PolygonScan.
* **Payment Processor:** Stripe (selected).

## 9. Constraints & Considerations

* **Solopreneur:** Resource-constrained (time, budget). Need to prioritize ruthlessly and leverage automation/AI.
* **Location:** Operating from Zapopan, Jalisco, Mexico. Need to comply with Mexican business registration, tax (IVA, ISR), and data privacy (LFPDPPP) laws. Leverage local ecosystem (Jalisco Tech Hub) if possible.
* **Global Operation:** Need to handle international payments, comply with relevant international data privacy laws (GDPR, CCPA) for users in those regions, consider cross-border tax implications.
* **Trust Building:** Critical, especially as a new player operating remotely. Requires transparency, security focus, clear communication, and potentially local partnerships.
* **Security:** Paramount. Requires secure coding practices, smart contract audits (when budget allows), infrastructure security, secure key management.
* **Scalability:** Design with future scaling in mind, but optimize MVP for lean operation.
* **Cost-Effectiveness:** Utilize free/low-cost tiers and cost-efficient technologies (Polygon PoS, AI tools) where possible. Monitor Stripe fees and blockchain gas costs.

## 10. Success Metrics (MVP & Beyond)

* Number of registered users (Free & Paid Tiers).
* Number of files timestamped/IP-NFTs minted.
* User activation rate (users who timestamp at least one file).
* Conversion rate from Free to Paid tiers (Post-MVP).
* Average Revenue Per User (ARPU) (Post-MVP).
* Churn Rate (Post-MVP).
* User feedback scores (simplicity, reliability, value).
* Platform uptime / reliability.
