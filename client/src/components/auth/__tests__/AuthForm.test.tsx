import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthForm from '../AuthForm'; // Adjust path as necessary
import { createClient } from '@/lib/supabase/client';

// Mock the Supabase client module
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

import type { SupabaseClient, Session, AuthChangeEvent, Subscription } from '@supabase/supabase-js'; // Import more types
// Removed AuthProps import as it might not be exported

// Mock the Supabase client module
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

// Mock the Supabase Auth UI component
vi.mock('@supabase/auth-ui-react', () => ({
  // Define a simple inline type for the mock props
  Auth: (props?: { view?: string }) => (
    <div data-testid="supabase-auth-ui">
      Mock Supabase Auth UI - View: {props?.view ?? 'sign_in'} {/* Default to sign_in */}
    </div>
  ),
}));

// Define a partial mock type for the client for easier mocking using Vitest types
// Ensure Vitest types are available (e.g., via tsconfig or explicit import if needed)
type MockSupabaseClient = {
    auth: {
        getSession: import('vitest').Mock;
        onAuthStateChange: import('vitest').Mock;
        signOut: import('vitest').Mock;
    };
};

describe('AuthForm Component', () => {
  let mockSupabaseClient: MockSupabaseClient;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock Supabase client behavior
    mockSupabaseClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }), // Default: no session
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    (createClient as vi.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('should render the Supabase Auth UI when no session exists', async () => {
    render(<AuthForm />);

    // Wait for useEffect to run and state to potentially update
    await waitFor(() => {
      expect(screen.getByTestId('supabase-auth-ui')).toBeInTheDocument();
    });
    expect(screen.getByText(/Mock Supabase Auth UI - View: sign_in/i)).toBeInTheDocument();
    expect(screen.queryByText(/Logged in as:/i)).not.toBeInTheDocument();
  });

  it('should display user email and sign out button when a session exists', async () => {
    // Arrange: Mock getSession to return a session
    const mockSession = {
      user: { email: 'test@example.com', id: '123' },
      // Add other necessary session properties if needed
    };
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });
    // Mock onAuthStateChange to immediately provide the session
    // Add types for callback parameters
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation(
        (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
            callback('SIGNED_IN', mockSession as Session); // Simulate immediate sign-in state
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
    );


    render(<AuthForm />);

    // Wait for session state to be updated and component to re-render
    await waitFor(() => {
      expect(screen.getByText(/Logged in as: test@example.com/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
    expect(screen.queryByTestId('supabase-auth-ui')).not.toBeInTheDocument();
  });

  it('should call supabase.auth.signOut when sign out button is clicked', async () => {
     // Arrange: Mock getSession to return a session
     const mockSession = { user: { email: 'test@example.com', id: '123' } };
     mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
     mockSupabaseClient.auth.onAuthStateChange.mockImplementation(
        (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
            callback('SIGNED_IN', mockSession as Session);
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
     );

    render(<AuthForm />);

    // Wait for the sign out button to appear
    const signOutButton = await screen.findByRole('button', { name: /Sign Out/i });
    signOutButton.click();

    // Assert: Check if signOut was called
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from auth state changes on unmount', async () => {
    const unsubscribeMock = vi.fn();
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    const { unmount } = render(<AuthForm />);

    // Wait for initial render effects
    await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    // Assert: Check if unsubscribe was called
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

});
