import axios from 'axios';
import { api } from '../api';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProjects делает правильный запрос', async () => {
    const mockResponse = { data: { success: true, projects: [] } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await api.getProjects('user123');
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/user123'
    );
    expect(result).toEqual(mockResponse);
  });

  it('getProject делает запрос с id', async () => {
    const mockResponse = { data: { success: true, project: { id: '123' } } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    await api.getProject('123');
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3001/api/project/123'
    );
  });

  it('getSharedProject делает запрос с токеном', async () => {
    const mockResponse = { data: { success: true, project: {} } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    await api.getSharedProject('token123');
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3001/share/token123'
    );
  });

  it('обрабатывает ошибки', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValue(new Error(errorMessage));

    await expect(api.getProjects('user123')).rejects.toThrow(errorMessage);
  });
});