import { fetchEstablishments } from '../useEstablishments';
import api from '../../utils/api';

jest.mock('../../utils/api', () => ({
  get: jest.fn(),
}));

describe('useEstablishments Data Fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEstablishment = {
    id: 1,
    user_id: 10,
    name_by_company: 'Test Establishment',
    document: '00.000.000/0001-00',
    type: 'CAR_WASH_AND_PARKING',
    cor_system: '#FF5733',
    active: 1,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
    deleted_at: null,
  };

  it('resolves flat array returned from response.data.data', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: [mockEstablishment],
      },
    });

    const result = await fetchEstablishments();
    expect(api.get).toHaveBeenCalledWith('/user/establishment/list-establishment-user');
    expect(result).toEqual([mockEstablishment]);
  });

  it('resolves nested array returned from response.data.data.data', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          data: [mockEstablishment],
        },
      },
    });

    const result = await fetchEstablishments();
    expect(api.get).toHaveBeenCalledWith('/user/establishment/list-establishment-user');
    expect(result).toEqual([mockEstablishment]);
  });

  it('resolves double nested array returned from response.data.data.data.data', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          data: {
            data: [mockEstablishment],
          },
        },
      },
    });

    const result = await fetchEstablishments();
    expect(api.get).toHaveBeenCalledWith('/user/establishment/list-establishment-user');
    expect(result).toEqual([mockEstablishment]);
  });

  it('returns empty array when data payload is missing or invalid', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: null,
      },
    });

    const result = await fetchEstablishments();
    expect(result).toEqual([]);
  });
});
