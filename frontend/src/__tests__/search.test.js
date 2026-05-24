import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../components/Search';

// Mock fetch globally
global.fetch = jest.fn();

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders search container with correct testid', () => {
    render(<Search />);
    
    const searchContainer = screen.getByTestId('search-container');
    expect(searchContainer).toBeInTheDocument();
  });

  test('handles user input correctly', async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const user = userEvent.setup();
    
    await user.type(searchInput, 'test query');
    
    expect(searchInput).toHaveValue('test query');
  });

  test('shows loading state during search', async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    const user = userEvent.setup();
    
    // Mock slow fetch response
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] })
        }), 1000)
      )
    );
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    const loadingElement = screen.getByText('Searching...');
    expect(loadingElement).toBeInTheDocument();
    
    await waitFor(() => {
      expect(loadingElement).not.toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    const user = userEvent.setup();
    
    // Mock failed fetch response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      })
    );
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    await waitFor(() => {
      const errorElement = screen.getByText(/error/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  test('displays search results when API returns data', async () => {
    const mockResults = [
      { id: 1, title: 'Result 1', description: 'First result' },
      { id: 2, title: 'Result 2', description: 'Second result' }
    ];
    
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    const user = userEvent.setup();
    
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: mockResults })
      })
    );
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Result 1')).toBeInTheDocument();
      expect(screen.getByText('Result 2')).toBeInTheDocument();
    });
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<Search />);
    
    const searchContainer = screen.getByTestId('search-container');
    expect(searchContainer).toBeInTheDocument();
    
    // Check that the component has proper aria attributes
    expect(screen.getByPlaceholderText('Search...')).toHaveAttribute('aria-label', 'Search input');
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    
    // Verify the overall structure is accessible
    expect(container).toHaveAccessibleName('Search Component');
  });
});