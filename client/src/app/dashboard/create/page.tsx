// Page for creating new IPNFTs
'use client';

import FileUploadComponent from '@/components/upload/FileUploadComponent';
import Sidebar from '@/components/dashboard/Sidebar'; // Keep sidebar for consistent layout

export default function CreateIpNftPage() {
  return (
    <div className="flex h-screen bg-muted/40 dark:bg-muted/10">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header for this specific page */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Create New IPNFT</h1>
        </div>

        {/* Minting Engine Section */}
        <section id="create-ipnft" className="bg-card p-6 rounded-lg shadow">
             {/* Removed centering div, let FileUploadComponent handle its width */}
             <FileUploadComponent />
        </section>
      </main>
    </div>
  );
}
