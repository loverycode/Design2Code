import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

describe('Header', () => {
  it('рендерит логотип и название', () => {
    render(<Header />);
    expect(screen.getByText('Swagger')).toBeInTheDocument();
    expect(screen.getByText('Supported by Design2Code')).toBeInTheDocument();
  });

  it('рендерит все пункты меню', () => {
    render(<Header />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('показывает кнопки Sign In и Get started', () => {
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });
});