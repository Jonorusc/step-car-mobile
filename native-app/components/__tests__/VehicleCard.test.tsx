import React from 'react';
import renderer, { act } from 'react-test-renderer';
import VehicleCard from '../VehicleCard';
import { Vehicle } from '@/hooks/useVehicles';

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

const mockVehicle: Vehicle = {
  id: 1,
  establishmentId: 1,
  user_id: 1,
  companyId: null,
  plate: 'ABC1234',
  model: 'Fusca',
  color: 'Azul',
  price: 500000,
  price_formatted: 'R$ 5.000,00',
  discount: 10000,
  discount_formatted: 'R$ 100,00',
  created_at_formatted: '10/10/2023',
  created_at: '2023-10-10',
  services: [],
  company: null,
};

describe('VehicleCard', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <VehicleCard vehicle={mockVehicle} onPrint={jest.fn()} onDelete={jest.fn()} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});
