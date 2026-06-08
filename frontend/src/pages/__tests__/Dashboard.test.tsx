import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    getProjects: jest.fn(),
  },
}));

const mockProjects = [
  { id: '1', projectName: 'Ecommerce App', componentName: 'Button', createdAt: '2024-01-01', shareToken: 'token1' },
  { id: '2', projectName: 'Ecommerce App', componentName: 'Card', createdAt: '2024-01-02', shareToken: 'token2' },
  { id: '3', projectName: 'Dashboard', componentName: 'Sidebar', createdAt: '2024-01-03', shareToken: 'token3' },
];

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('показывает лоадер при загрузке', () => {
    (api.getProjects as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('загружает и отображает проекты', async () => {
    (api.getProjects as jest.Mock).mockResolvedValue({ data: { projects: mockProjects } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ecommerce App')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('группирует проекты по projectName', async () => {
    (api.getProjects as jest.Mock).mockResolvedValue({ data: { projects: mockProjects } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('2 components')).toBeInTheDocument();
    });
  });

  it('показывает сообщение, если нет проектов', async () => {
    (api.getProjects as jest.Mock).mockResolvedValue({ data: { projects: [] } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('У вас пока нет проектов. Экспортируйте макет из Figma.')).toBeInTheDocument();
    });
  });

  it('разворачивает группу при клике', async () => {
    (api.getProjects as jest.Mock).mockResolvedValue({ data: { projects: mockProjects } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ecommerce App')).toBeInTheDocument();
    });

    const groupHeader = screen.getByText('Ecommerce App').closest('div');
    
    await act(async () => {
      userEvent.click(groupHeader!);
    });

    await waitFor(() => {
      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
    });
  });
});