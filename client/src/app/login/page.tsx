// Mark this page as statically generated for better performance
export const dynamic = 'force-static';

import AuthForm from '@/components/auth/AuthForm';

/**
 * Login page component
 * This page is publicly accessible
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Veltis</h1>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
