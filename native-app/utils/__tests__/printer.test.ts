import { buildPrintMessage } from '../printer';
import { CUPOM } from '@/types';

describe('Printer Utility', () => {
  const mockEstablishment = {
    id: 1,
    userId: 10,
    active: true,
    corSystem: '#008080',
    document: '12345678901234',
    nameByCompany: 'Test CarWash',
    type: 'wash',
    coupon: { info: 'Obrigado pela preferência!' },
    created_at_formatted: '01/01/2026',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: '',
  };

  it('generates a print buffer successfully for category-grouped services payload', async () => {
    const data: CUPOM = {
      vehicleToCupom: {
        id: 1,
        plate: 'ABC1234',
        model: 'Civic',
        color: 'Prata',
        price: 8000,
        price_formatted: 'R$ 80,00',
        discount: 1000,
        created_at_formatted: '01/01/2026',
      },
      collectCategoriesToModal: [
        { label: 'Lavagem', value: 1 }
      ],
      collectFormattedServicesToModal: [
        { id: 1, name: 'Lavagem Completa', price: 8000, category_id: 1 }
      ],
      establishment: mockEstablishment,
      discount: 1000,
    };

    const buffer = await buildPrintMessage(data);
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('generates a print buffer successfully for direct list services payload', async () => {
    const data: CUPOM = {
      vehicleToCupom: {
        id: 2,
        plate: 'XYZ9876',
        model: 'Corolla',
        color: 'Preto',
        price: 9000,
        price_formatted: 'R$ 90,00',
        discount: 0,
        created_at_formatted: '02/01/2026',
        services: [
          { id: 2, name: 'Ducha rápida', price: 5000 }
        ]
      },
      collectCategoriesToModal: 'Ducha rápida', // String fallback
      collectFormattedServicesToModal: [
        { id: 2, name: 'Ducha rápida', price: 5000 }
      ],
      establishment: mockEstablishment,
      discount: 0,
    };

    const buffer = await buildPrintMessage(data);
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
