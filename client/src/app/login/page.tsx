import AuthForm from '@/components/auth/AuthForm';

/**
 * Login Page Component.
 *
 * Renders the main authentication form component.
 * This page allows users to sign in or sign up.
 *
 * @returns {JSX.Element} The login page structure.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to VeriSci Ledger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Securely timestamp your R&D assets.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
