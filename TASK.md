# TASK - Veltis Protocol Project

## Current Tasks (Phase 2: Pivot - Research & New IPNFT Implementation - 2025-04-16)

*   [ ] **Research Standards & Repos:** Investigate CMTA (CMTAT-1, RuleEngine, CMTAT-Foundry), Molecule Protocol, VitaDAO, and Taurus Group repositories/standards for best practices in IPNFT representation, user-driven minting (Metamask), custody, and Polygon deployment.
    *   [x] Use Perplexity MCP for high-level overview. (Completed: 2025-04-16)
    *   [ ] Use GitHub MCP to examine specific contracts/code.
*   [ ] **Propose New Smart Contract Design:** Based on research, define the architecture for the new IPNFT contract(s) (e.g., core ERC721, factory, metadata standards, user minting flow). Present design for approval.
    *   **Decision (2025-04-16):** Proceed with direct user-driven minting via Metamask for a new ERC-721 contract (UUPS upgradeable). Defer separate "Proof of Invention" (PoI) step for MVP. Core flow: User Upload -> Backend Prepares Metadata URI -> Frontend Prompts Metamask Mint Signature.
*   [x] **Implement New Smart Contract(s):** Write Solidity code for the approved design (`VeltisIPNFT.sol`). (Completed: 2025-04-21)
*   [x] **Write Unit Tests:** Develop comprehensive tests for the new contract (`VeltisIPNFT.test.ts`). (Completed: 2025-04-21)
*   [x] **Refactor Backend:** Updated `blockchain.ts` to handle the new contract ABI and created server endpoints for preparing metadata and confirming mints. (Completed: 2025-04-21)
*   [x] **Refactor Frontend:** Implemented Metamask wallet connection with the new WalletConnector component and updated FileUploadComponent to support direct user minting. (Completed: 2025-04-21)
*   [ ] **Update Database:** Modify schema (`ip_records`, etc.) if required by the new contract design or minting flow.
*   [ ] **Deploy & Test:** Deploy the new contract(s) to Amoy testnet and perform thorough end-to-end testing.

---
## Obsolete Tasks (Abandoned ERC721 Implementation - 2025-04-16)

*   ~~**Design Veltis ERC721 Contract:** Decided on ERC721Upgradeable, UUPS, Ownable, URIStorage, Burnable, storing fileHash, owner-updatable URI. (Completed: 2025-04-15)~~
*   ~~**Implement `VeltisERC721IPNFT.sol`:** Wrote initial Solidity code based on design, inheriting from OZ upgradeable contracts. Installed dependencies & fixed compilation issues via remapping. (Completed: 2025-04-16)~~
*   ~~**Write Unit Tests:** Created Hardhat test file (`test/VeltisERC721IPNFT.test.ts`) with initial tests covering deployment, minting, metadata, file hash, and burning. Fixed compilation/type errors. (Completed: 2025-04-16)~~
*   ~~**Refactor Backend (`blockchain.ts`):** Update functions to interact with the new ERC721 ABI (Application Binary Interface) - particularly the `mint` function signature and parameters.~~
*   ~~**Refactor Backend (`fileController.ts`):** Adjust the minting logic call to match the new `blockchain.ts` functions and ERC721 parameters. Update how token ID is retrieved (likely from mint function return value or event).~~
*   ~~**Refactor DB (`ip_records`):** Ensure the `nft_token_id` column can store standard ERC721 token IDs (typically `uint256`, potentially stored as TEXT if very large, but less likely than ERC1155 IDs). Ensure `nft_contract_address` points to the new contract.~~
*   ~~**Refactor Frontend:** Update any UI elements that display NFT details (e.g., Dashboard) to correctly interpret and link to the ERC721 token on block explorers.~~
*   ~~**Deploy & Test:** Deploy the new `VeltisERC721IPNFT.sol` contract to Amoy testnet and perform end-to-end testing of the minting flow via the application.~~

## Backlog / Future Phases

### Phase 3: Fractionalization Integration
*   **Select Protocol:** Finalize choice of external fractionalization protocol (e.g., Tessera).
*   **Backend Integration:** Implement logic to call the chosen protocol's contracts (e.g., vault factory) to lock a Veltis ERC721 IPNFT and receive fractional ERC20 tokens.
*   **Frontend Integration:** Add UI for users to initiate fractionalization of their IPNFTs. Display fractional token balances/links.

### Phase 4: Subscriptions & Tiers (Startup/Institution)
*   Implement Startup Tier features (Teams, Monthly Limits, Versioning, Basic API, Basic AC).
*   Implement Institution Tier features (Advanced AC/Lit, Audit Logs, Advanced Teams, API).
*   Implement Stripe integration (Checkout, Webhooks, Customer Portal).

### Other Backlog Items
*   Client-side hashing.
*   Batch file uploads.
*   Advanced dashboard analytics.
*   Support for additional blockchains.
*   Enhanced certificate customization.
*   Collaboration features.
*   Mobile application.
*   Smart contract audit (for Veltis ERC721 and integrations).
*   Referral program.
*   `CONTRIBUTING.md`.
*   CI/CD pipeline (GitHub Actions).

## Completed (MVP Phase 1 & Initial Phase 2 Planning)

*   **Setup Project Structure:** (2025-04-10) Initialized Git, set up minimal Node/Express backend, Next.js frontend, Supabase integration points (`@supabase/ssr`), Vitest config.
*   **Implement User Authentication (Supabase):** (2025-04-10) Implemented frontend auth using Supabase SDKs/UI, configured middleware, added basic component tests.
*   **Design Core Database Schema (Supabase):** (2025-04-11) Defined `files` and `ip_records` tables with RLS via SQL.
*   **Develop File Upload & Hashing:** (2025-04-11) Created backend endpoint for file upload and SHA-256 hashing.
*   **Design IP-NFT Smart Contract (ERC-1155):** (2025-04-11) Created basic contract, deployment script, and tests using Hardhat/OpenZeppelin.
*   **Implement Blockchain Anchoring Service:** (2025-04-11) Added ethers.js setup and function to send anchoring transaction from backend.
*   **Integrate Decentralized Storage (IPFS):** (2025-04-11) Switched to Pinata SDK integration for file/JSON uploads via backend endpoint.
*   **Implement NFT Minting Logic:** (2025-04-11) Completed backend orchestration: hash -> IPFS (Pinata) -> Anchor TX -> Metadata IPFS (Pinata) -> Contract Mint -> DB Save (Supabase).
*   **Develop User Dashboard UI:** (2025-04-11) Created basic dashboard page to display user records.
*   **Implement Landing Page UI & File Upload:** (2025-04-12) Created landing page components based on design ref, integrated file upload for logged-in users, added Shadcn/Lucide, updated Hero content.
*   **Implement Certificate Generation:** (2025-04-12) Added backend endpoint and pdfkit utility to generate PDF certificates.
*   **Develop Verification Tool UI/Backend:** (2025-04-12) Added public verification endpoint and frontend UI.
*   **Integrate Basic Access Control (Placeholder/Mock):** (2025-04-12) Added DB columns and code comment placeholders.
*   **Write Initial README.md Sections:** (2025-04-12) Added Setup/Usage, omitted License.
*   **Setup Basic Deployment Guidance:** (2025-04-12) Added detailed deployment instructions to README.md.
*   **Implement Innovator Tier Limits (Phase 2):**
    *   [x] **DB Schema:** Created `profiles` table linked 1:1 to `auth.users`. Added `ip_record_count` (INT) and `storage_used_bytes` (BIGINT) columns. Added trigger to create profile on user signup. Set up RLS policies. (Completed: 2025-04-14)
    *   [x] **Backend Logic:** Modified `fileController.ts` (`handleFileUpload`) to query `profiles` table for usage, check Innovator tier limits (5 records, 100MB storage), and call `increment_user_usage` RPC to update limits on success. (Completed: 2025-04-14)
    *   [x] **Frontend UI:** Modified `FileUploadComponent.tsx` to fetch profile data (`ip_record_count`, `storage_used_bytes`), display usage vs limits, and disable upload button when limits are reached. (Completed: 2025-04-14)
*   **Setup Startup Tier DB Schema (Phase 2.1):**
    *   [x] **DB Schema:** Created `subscriptions`, `teams`, `team_members` tables. Added `team_id`, `previous_record_id` to `ip_records`. Set up RLS. (Completed: 2025-04-14)
*   **Setup Stripe Backend Client (Phase 2.1):**
    *   [x] **Backend - Stripe Lib & Config:** Installed `stripe` library. Added keys to `.env.example`. Initialized client in `src/config/stripe.ts`. (Completed: 2025-04-14)


## Discovered During Work

*   [x] **Fix Edge Runtime Authentication Error:** Fixed Vercel deployment issue by moving authentication logic from Edge middleware to Server Components. Implemented authentication in dashboard and verification layout components. Specifically:
    * Renamed middleware.ts to _middleware.ts to disable it
    * Created server-side authentication in dashboard/layout.tsx and verify/layout.tsx
    * Refactored supabase/server.ts to handle cookies properly in Server Components
    * This resolved the "No fetch event listeners found" error in Vercel's Edge Runtime
    * (Completed: 2025-04-21)
*   [x] **Fix 404 Error on Deployed Site:** Fixed 404 errors during static generation by updating rendering strategy:
    * Added explicit dynamic configuration to protected routes with 'force-dynamic'
    * Added explicit static configuration to public routes with 'force-static'
    * Fixed auth callback route to properly handle dynamic rendering
    * Updated Next.js config to set proper rendering modes and server action origins
    * Fixed Vercel deployment configuration by simplifying vercel.json and adding specific files:
      - Simplified root vercel.json to only include API rewrites
      - Added .vercelignore to control which files are deployed
      - Added client/vercel.json to set framework type
      - This approach lets Vercel auto-detect the Next.js app in the client directory
    * (Completed: 2025-04-21)
