// Make this a Client Component to use hooks for potential client-side data or interactions later
'use client';

import { createClient } from '@/lib/supabase/client'; // Use client for potential future interactions
import { useState, useEffect } from 'react'; // Import hooks
import { useRouter } from 'next/navigation'; // Use useRouter for client-side navigation if needed
import Link from 'next/link';
// import FileUploadComponent from '@/components/upload/FileUploadComponent'; // Removed import
import Sidebar from '@/components/dashboard/Sidebar'; // Import the Sidebar

// TODO: Define types for fetched data (ideally generated from Supabase schema later)
interface IpRecord {
  id: string;
  asset_name: string;
  status: string;
  created_at: string;
  nft_token_id: string | null;
  nft_contract_address: string | null;
  metadata_cid: string | null;
  files: { // This should be the related file object, or null
    id: string;
    original_filename: string;
    sha256_hash: string;
    storage_ref: string; // File CID
  } | null;
}

/**
 * User Portfolio Page (Client Component).
 * Fetches and displays the logged-in user's IP records (Portfolio).
 */
export default function DashboardPage() { // Renamed conceptually to Portfolio Page
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ipRecords, setIpRecords] = useState<IpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Check auth state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log('User not authenticated on portfolio, redirecting.');
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch user's IP records from Supabase
      const { data, error: fetchError } = await supabase
        .from('ip_records')
        .select(`
          id,
          asset_name,
          status,
          created_at,
          nft_token_id,
          nft_contract_address,
          metadata_cid,
          files (
            id,
            original_filename,
            sha256_hash,
            storage_ref
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching IP records:', fetchError);
        setError(`Error loading portfolio data: ${fetchError.message}`);
      } else {
        const formattedData = data?.map(record => ({
            ...record,
            files: Array.isArray(record.files) ? (record.files[0] ?? null) : (record.files ?? null)
        })) || [];
        setIpRecords(formattedData as IpRecord[]);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);


  if (loading) {
    return (
        <div className="flex h-screen bg-muted/40 dark:bg-muted/10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">Loading portfolio...</main>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex h-screen bg-muted/40 dark:bg-muted/10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 text-red-500">{error}</main>
        </div>
     );
  }

  // Main portfolio layout
  return (
    <div className="flex h-screen bg-muted/40 dark:bg-muted/10"> {/* Apply background to full layout */}
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8"> {/* Main content area */}
        {/* Portfolio Page Header */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
            {/* Add other header elements like search or filters later */}
        </div>

         {/* Grid for main content sections */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Left Column (Portfolio Table + Analytics Placeholder) */}
            <div className="xl:col-span-2 space-y-8">
                 {/* Section: Portfolio Table */}
                 <section id="portfolio">
                    {/* Title moved to page header */}
                    {ipRecords && ipRecords.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border bg-card shadow">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              <th scope="col" className="px-6 py-3">Asset Name</th>
                              <th scope="col" className="px-6 py-3">Filename</th>
                              <th scope="col" className="px-6 py-3">Status</th>
                              <th scope="col" className="px-6 py-3">Timestamped</th>
                              <th scope="col" className="px-6 py-3">Token ID (Amoy)</th>
                              <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {ipRecords.map((record: IpRecord) => (
                              <tr key={record.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{record.asset_name ?? 'N/A'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{record.files?.original_filename ?? 'N/A'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{record.status}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{new Date(record.created_at).toLocaleString()}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                  {record.nft_token_id ? (
                                    <a
                                      href={`https://amoy.polygonscan.com/nft/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? 'YOUR_CONTRACT_ADDRESS'}/${record.nft_token_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                      title="View on PolygonScan (Amoy)"
                                    >
                                      {record.nft_token_id}
                                    </a>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-2">
                                   {/* Link to download certificate */}
                                   <a href={`/api/records/${record.id}/certificate`} className="text-primary hover:underline" title="Download Certificate">
                                     Cert
                                   </a>
                                   {/* Link to view file on IPFS */}
                                   {record.files?.storage_ref && (
                                      <a
                                          href={`https://gateway.pinata.cloud/ipfs/${record.files.storage_ref}`} // TODO: Make gateway configurable?
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                          title="View File on IPFS"
                                      >
                                          File
                                      </a>
                                   )}
                                   {/* Placeholder Action Buttons */}
                                   <button className="ml-2 text-xs text-blue-500 hover:underline disabled:opacity-50" disabled title="Update Project (coming soon)">Update</button>
                                   <button className="ml-2 text-xs text-red-500 hover:underline disabled:opacity-50" disabled title="Send NFT (coming soon)">Send</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground bg-card rounded-lg shadow">You haven't created any IPNFTs yet.</div>
                    )}
                 </section> {/* Close the portfolio section */}

                 {/* Placeholder Analytics Section */}
                 <section className="p-6 bg-card rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Portfolio Analytics</h2>
                    <p className="text-sm text-muted-foreground mb-4">Visual graphs and figures about your IPNFTs (coming soon).</p>
                    <div className="h-48 bg-muted rounded flex items-center justify-center text-muted-foreground">Graph Placeholder</div>
                 </section>
            </div> {/* Close Left Column */}

            {/* Right Column (Wallet + Transactions) */}
            <div className="xl:col-span-1 space-y-8">
                 {/* Placeholder Wallet Section */}
                 <section className="p-6 bg-card rounded-lg shadow">
                     <h2 className="text-xl font-semibold mb-4">Wallet Overview</h2>
                     {/* TODO: Fetch and display actual wallet balance */}
                     <p className="text-muted-foreground mb-2">Balance: <span className="font-semibold">-- MATIC</span></p>
                     <div className="h-20 bg-muted rounded flex items-center justify-center text-muted-foreground">Transaction Buttons Placeholder</div>
                 </section>

                 {/* Placeholder Transaction Summary */}
                 <section className="p-6 bg-card rounded-lg shadow">
                     <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                     {/* TODO: Fetch and display recent transactions */}
                     <div className="h-48 bg-muted rounded flex items-center justify-center text-muted-foreground">Transaction List Placeholder</div>
                 </section>
            </div> {/* Close Right Column div */}
         </div> {/* Close main content grid div */}
       </main> {/* End main content area */}
    </div> // Close the root flex container
  );
}
