import { render, screen, fireEvent } from '@testing-library/react';
import LeadForm from '../page';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/components/AuthProvider', () => ({ useAuth: jest.fn() }));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }) }),
    })),
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user1' } } } }) },
  })),
}));

describe('LeadForm', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });
  });

  it('renders form fields', () => {
    render(<LeadForm />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    render(<LeadForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByText(/Save Buyer/i));

    await screen.findByText(/Buyer saved successfully!/i); // Wait for alert
    expect(screen.getByText(/Full Name/i)).toHaveValue(''); // Reset check
  });
});