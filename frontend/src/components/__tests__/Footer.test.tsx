import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('рендерит текст Supported by Design2Code', () => {
    render(<Footer />);
    expect(screen.getByText('Supported by Design2Code')).toBeInTheDocument();
  });

  it('применяет переданный className', () => {
    render(<Footer className="custom-class" />);
    const footer = screen.getByText('Supported by Design2Code').closest('footer');
    expect(footer).toHaveClass('custom-class');
  });
});