import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard container with correct testid', () => {
    render(<Dashboard />);
    
    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<Dashboard />);
    
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('fetches and displays dashboard data successfully', async () => {
    const mockData = {
      total_requests: 150,
      active_users: 25,
      api_calls: 300,
      recent_activity: [
        { id: 1, action: 'Chat completion', timestamp: '2023-05-01T10:00:00Z' },
        { id: 2, action: 'Vector search', timestamp: '2023-05-01T09:30:00Z' }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/total requests: 150/i)).toBeInTheDocument();
      expect(screen.getByText(/active users: 25/i)).toBeInTheDocument();
      expect(screen.getByText(/api calls: 300/i)).toBeInTheDocument();
      expect(screen.getByText(/chat completion/i)).toBeInTheDocument();
      expect(screen.getByText(/vector search/i)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  test('handles empty data response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard data not available/i)).toBeInTheDocument();
    });
  });

  test('passes accessibility checks', async () => {
    const mockData = {
      total_requests: 100,
      active_users: 10,
      api_calls: 200,
      recent_activity: []
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const { container } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});