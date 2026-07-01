import { render, screen } from '@testing-library/react';
import App from './App';

describe('App admin routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('shows the news feed by default without exposing the admin dashboard button', () => {
    render(<App />);

    expect(screen.getByText(/manage your african news/i)).toBeInTheDocument();
    expect(screen.queryByText(/open admin dashboard/i)).not.toBeInTheDocument();
  });

  test('renders the admin dashboard when the URL path is /admin', () => {
    window.history.pushState({}, '', '/admin');
    render(<App />);

    expect(screen.getByText(/administrator sign in/i)).toBeInTheDocument();
  });
});
