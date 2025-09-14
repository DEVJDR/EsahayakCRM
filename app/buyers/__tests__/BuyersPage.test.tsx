import { render, screen, fireEvent } from '@testing-library/react';
import BuyersPage from '../page';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/buyers'),
}));
jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

describe('BuyersPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' }, session: { user: { id: 'user1' } } });
  });

  it('renders loading state', () => {
    render(<BuyersPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders buyers table on success', async () => {
    const mockBuyers = [{ id: '1', fullName: 'John Doe', email: 'john@example.com', phone: '1234567890', city: 'Chandigarh', propertyType: 'Apartment', timeline: '0-3m', status: 'New', updatedAt: '2025-09-14T10:00:00Z' }];
    require('../page').fetchBuyers = jest.fn().mockResolvedValue({ setBuyers: jest.fn().mockImplementation((data) => data), setLoading: jest.fn(), setFetchError: jest.fn(), setTotalCount: jest.fn() });

    render(<BuyersPage />);
    await screen.findByText('John Doe');
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Edit buyer John Doe/i })).toBeInTheDocument();
  });

  it('handles filter change', () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<BuyersPage />);
    const citySelect = screen.getByLabelText('City filter');
    fireEvent.change(citySelect, { target: { value: 'Mohali' } });

    expect(mockRouter.push).toHaveBeenCalledWith('/buyers?city=Mohali&page=1');
  });
});