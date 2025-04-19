# Veltis Protocol

## About

Veltis Protocol is a micro-SaaS platform designed to provide simple, secure, and verifiable blockchain-based timestamping and proof-of-existence for R&D assets like intellectual property disclosures, research data, and other sensitive documents.

This project aims to streamline R&D documentation, enhance trust, and facilitate secure collaboration.

## Tech Stack (MVP)

*   **Frontend:** React, Next.js, Tailwind CSS
*   **Backend:** Minimal Node.js/Express (for metadata preparation, Pinata uploads)
*   **Database & Auth:** Supabase
*   **Blockchain:** Polygon PoS
*   **Smart Contracts:** Solidity (ERC-721 via OpenZeppelin, UUPS Upgradeable), Hardhat
*   **Decentralized Storage:** IPFS (via Pinata)
*   **UI Components:** Shadcn UI, Lucide React
*   **Testing:** Vitest, React Testing Library

## Project Structure

*   `client/`: Contains the Next.js frontend application.
*   `server/`: Contains the minimal Node.js/Express backend application.
*   `PLANNING.md`: Project vision, goals, architecture, and constraints.
*   `TASK.md`: Detailed task list for development phases.

## Getting Started

The main user interaction (file upload/timestamping for logged-in users) happens on the landing page (`/`). Logged-out users will see prompts to log in or join.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd veltis-protocol # Or your project directory name
    ```
2.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   In your Supabase project dashboard, go to **Project Settings** > **API**.
    *   Find your **Project URL** and **anon public key**.
    *   Optionally, find your **service_role secret key** (keep this secure!).
3.  **Configure Environment Variables:**
    *   **Client:** Create a file named `.env.local` inside the `client/` directory. Copy the contents of `client/.env.example` into it and replace the placeholder values with your actual Supabase URL and anon key:
        ```env
        # client/.env.local
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   **Server (Optional):** If you plan to use backend admin functions, create a file named `.env` inside the `server/` directory. Copy the contents of `server/.env.example` into it and replace the placeholders with your Supabase URL and service role key:
        ```env
        # server/.env
        PORT=5001
        SUPABASE_URL=YOUR_SUPABASE_URL
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
        ```
4.  **Install Dependencies:**
    *   Install frontend dependencies:
        ```bash
        cd client
        npm install
        cd ..
        ```
    *   Install backend dependencies:
        ```bash
        cd server
        npm install
        cd ..
        ```
    *   Install contract dependencies:
        ```bash
        cd contracts
        npm install
        cd ..
        ```
5.  **Deploy Smart Contract (Optional - for local testing/development):**
    *   Ensure your `server/.env` file has the `POLYGON_RPC_URL` (e.g., for Mumbai testnet or a local Hardhat node) and `PLATFORM_WALLET_PRIVATE_KEY` set.
    *   Run the deployment script (adjust network flag as needed):
        ```bash
        cd contracts
        npx hardhat ignition deploy ignition/modules/DeployVeltisIPNFT.ts --network localhost
        ```
    *   Copy the deployed contract address output by the script.
    *   Update `VELTIS_IPNFT_CONTRACT_ADDRESS` in your `server/.env` file with the deployed address.

## Running the Project

1.  **Start the Frontend Development Server:**
    ```bash
    cd client
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000` (or the next available port).

2.  **Start the Backend Development Server (Optional):**
    ```bash
    cd server
    npm run dev
    ```
    The backend API (if used) will be available at `http://localhost:5001` (or the port specified in `server/.env`).

## Running Tests

*   **Frontend Tests:**
    ```bash
    cd client
    npm test
    # Or for coverage:
    npm run coverage
    ```
*   **Backend Tests (if applicable):**
    ```bash
    cd server
    npm test
    # Or for coverage:
    npm run coverage
    ```

## Basic Usage

1.  **Navigate** to the running frontend application (e.g., `http://localhost:3000`).
2.  **Login/Sign Up:** Use the "LOGIN" button on the header or the prompt on the landing page to access the login/signup form (`/login`). Create an account or log in.
3.  **Connect Wallet:** Ensure your Metamask wallet (or similar) is connected to the Polygon network (e.g., Amoy Testnet for development). The application should prompt you to connect if you haven't already.
4.  **Mint IPNFT:** Once logged in and wallet connected, the landing page (`/`) will display the file upload component.
    *   Select a file (e.g., a PDF).
    *   Click "Create IPNFT".
    *   The backend prepares the file hash and uploads the file and metadata to IPFS via Pinata.
    *   The frontend receives the metadata URI (`token_uri`).
    *   Your Metamask wallet will pop up, asking you to confirm the `safeMint` transaction (you will pay the gas fees).
    *   Approve the transaction in Metamask.
5.  **View Dashboard:** Once the transaction is confirmed on the blockchain, navigate to the `/dashboard` page to see your newly minted IPNFT listed.
6.  **Download Certificate:** On the dashboard, click the "Download Cert" link for a specific record to get its PDF certificate.
7.  **Verify Asset:** Navigate to the `/verify` page. Upload a file or enter its SHA-256 hash to check if it has been timestamped by the platform and view its details.

## Deployment

This section provides guidance on deploying the different parts of the Veltis Protocol application.

### Prerequisites

*   **Node.js & npm:** Ensure you have Node.js (v20 or later recommended) and npm installed.
*   **Git:** For cloning the repository.
*   **Supabase Account:** Free tier available at [supabase.com](https://supabase.com/).
*   **Pinata Account:** Free tier available at [pinata.cloud](https://pinata.cloud/).
*   **Crypto Wallet:** A wallet like MetaMask configured for Polygon (Mainnet or Mumbai Testnet). You'll need MATIC tokens for gas fees.
*   **Hosting Platforms:** Accounts on platforms like:
    *   **Vercel** (Recommended for Next.js frontend)
    *   **Railway / Render / Fly.io** (Recommended for Node.js backend/Docker)

### Environment Variables

Ensure you have the following environment variables set correctly in your deployment environments. **Never commit `.env` or `.env.local` files containing secrets to Git.** Use the environment variable configuration provided by your hosting platform.

**Client (Frontend - e.g., Vercel):**

*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon public key.
*   `NEXT_PUBLIC_API_URL` (Optional): The deployed URL of your backend server API (e.g., `https://your-server-app.onrender.com/api`). If not set, it might default to localhost or need adjustment in the client code depending on how API calls are made.
*   `NEXT_PUBLIC_CONTRACT_ADDRESS`: The deployed address of the `VeltisIPNFT` smart contract (needed for explorer links).

**Server (Backend - e.g., Railway/Render):**

*   `PORT`: The port the server should listen on (e.g., `5001`). Hosting platforms often set this automatically.
*   `SUPABASE_URL`: Your Supabase project URL.
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project service role key (keep this highly secure!).
*   `POLYGON_RPC_URL`: RPC URL for the target Polygon network (e.g., Mumbai Alchemy/Infura URL, or Polygon Mainnet RPC). Used by the backend for potential read operations or future interactions, and by Hardhat for deployment.
*   `PLATFORM_WALLET_PRIVATE_KEY`: Private key of the wallet used **only for deploying the smart contract** (keep this highly secure!). User minting transactions are paid by the user via Metamask. **Use a dedicated, funded wallet for deployment.**
*   `PINATA_API_KEY`: Your Pinata API Key.
*   `PINATA_SECRET_API_KEY`: Your Pinata Secret API Key.
*   `VELTIS_IPNFT_CONTRACT_ADDRESS`: The deployed address of the `VeltisIPNFT` smart contract.

### 1. Smart Contract Deployment (Polygon)

1.  **Configure Hardhat:**
    *   Ensure your `contracts/.env` file (or the root `.env` referenced by `hardhat.config.ts`) has the correct `POLYGON_RPC_URL` for the target network (e.g., Mumbai or Mainnet) and the `PLATFORM_WALLET_PRIVATE_KEY` for the **deployer wallet**.
    *   Make sure the **deployer wallet** has enough MATIC for gas fees on the target network (this wallet is only used for deployment, not user minting).
2.  **Compile:**
    ```bash
    cd contracts
    npx hardhat compile
    ```
3.  **Deploy:**
    *   Run the Hardhat Ignition deployment script, specifying the target network (e.g., `mumbai` or `polygon` if configured in `hardhat.config.ts`).
    ```bash
    # Example for Mumbai testnet
    npx hardhat ignition deploy ignition/modules/DeployVeltisIPNFT.ts --network mumbai
    ```
4.  **Record Address:** Note the deployed contract address output by the script.
5.  **Update Environment Variables:** Update `VELTIS_IPNFT_CONTRACT_ADDRESS` (for the server) and `NEXT_PUBLIC_CONTRACT_ADDRESS` (for the client) in your deployment environment settings with the new address.

### 2. Backend Deployment (Node.js/Express)

Platforms like Railway, Render, or Fly.io are suitable. They often support direct deployment from a Git repository containing a `Dockerfile`.

1.  **Push Code:** Ensure your latest code, including the `server/Dockerfile` and `server/.dockerignore`, is pushed to your Git repository (e.g., GitHub).
2.  **Create Service:** On your chosen platform (e.g., Railway):
    *   Create a new service/project.
    *   Connect it to your Git repository.
    *   Select the `server` directory as the root (if applicable) or ensure the platform detects the `Dockerfile` in the `server` subdirectory.
3.  **Configure Build:** The platform should automatically use the `Dockerfile` for building. Ensure the build context is set correctly if needed.
4.  **Set Environment Variables:** In the service's settings on the platform, add all the required **Server** environment variables listed above. **Do not hardcode secrets.**
5.  **Deploy:** Trigger a deployment. The platform will build the Docker image and run the container using `CMD ["node", "dist/server.js"]`.
6.  **Record URL:** Note the public URL assigned to your deployed backend service (e.g., `https://your-server-app.onrender.com`). You might need this for the `NEXT_PUBLIC_API_URL` in the frontend deployment.

### 3. Frontend Deployment (Next.js)

Vercel is highly recommended for Next.js applications.

1.  **Push Code:** Ensure your latest code is pushed to your Git repository.
2.  **Create Project:** On Vercel:
    *   Import your Git repository.
    *   Vercel should automatically detect it's a Next.js project.
3.  **Configure Project:**
    *   **Root Directory:** Ensure Vercel correctly identifies the `client` directory as the root of the Next.js application.
    *   **Build Command:** Should default correctly (`npm run build` or similar within the `client` directory).
    *   **Output Directory:** Should default correctly (`.next`).
4.  **Set Environment Variables:** In the project settings on Vercel, add all the required **Client** environment variables listed above (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, and optionally `NEXT_PUBLIC_API_URL` pointing to your deployed backend).
5.  **Deploy:** Trigger a deployment. Vercel will build and deploy your Next.js application.

### 4. Supabase

*   Supabase handles its own infrastructure.
*   Ensure your database schema (including tables and RLS policies) is set up correctly in your production Supabase project. You might need to run the initial schema SQL from `PLANNING.md` or use Supabase migrations.
*   Configure production settings like email templates, custom domains, etc., as needed in the Supabase dashboard.

### CI/CD (Future Enhancement)

*   **GitHub Actions:** You can set up workflows (`.github/workflows`) to automatically:
    *   Run tests on push/pull request.
    *   Deploy the frontend to Vercel on merges to the main branch.
    *   Build and push the backend Docker image to a registry (like Docker Hub or GitHub Container Registry) and trigger a deployment on Railway/Render on merges to the main branch.
    *   Potentially run contract tests or even deploy contracts (use with caution, requires secure secret handling).
