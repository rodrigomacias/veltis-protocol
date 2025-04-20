'use client'; // Make it a client component if settings need interaction

'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

// TODO: Replace with actual Shadcn components later
// Define more specific props type for Input if possible, using React.InputHTMLAttributes
const Input = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input id={id} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" {...props} />
    </div>
);
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
Button.defaultProps = { variant: "default", size: "default" }; // Removed @ts-ignore

const Switch = ({ label, id }: { label: string, id: string }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
        <button id={id} role="switch" aria-checked="false" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50">
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
        </button>
    </div>
);


export default function SettingsPage() {
    // TODO: Fetch user profile data (name, email etc.) to pre-fill form
    // TODO: Implement handleSave function

    // TODO: Fetch user profile data (name, email etc.) to pre-fill form
    // TODO: Implement handleSave functions

    return (
        <div className="flex h-screen bg-muted/40 dark:bg-muted/10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Settings Card */}
                    <section className="lg:col-span-2 bg-card p-6 rounded-lg shadow space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-3 mb-4">Profile Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Full Name" id="fullName" type="text" placeholder="Your Name" />
                            <Input label="Email Address" id="email" type="email" placeholder="your.email@example.com" disabled />
                        </div>
                         {/* Add more profile fields as needed: Company, Role, etc. */}
                         <Input label="Company (Optional)" id="company" type="text" placeholder="Your Company" />
                        <div className="flex justify-end">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Profile</Button>
                        </div>
                    </section>

                    {/* Other Settings Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-card p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Notifications</h2>
                            <Switch label="Email Notifications" id="emailNotifications" />
                            <Switch label="In-App Notifications" id="appNotifications" />
                            {/* Add more notification toggles */}
                        </section>

                        <section className="bg-card p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4">API Keys</h2>
                            <p className="text-sm text-muted-foreground">Manage your API keys for integrations (Feature coming soon).</p>
                            <Button disabled>Generate New API Key</Button>
                            {/* List existing keys later */}
                        </section>

                         <section className="bg-card p-6 rounded-lg shadow space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Account Actions</h2>
                            <Button variant="destructive" className="w-full">Delete Account</Button>
                         </section>
                    </div>
                </div>
            </main>
        </div>
    );
  }
