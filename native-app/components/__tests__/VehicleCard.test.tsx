import React from 'react';
import renderer, { act } from 'react-test-renderer';
import VehicleCard from '../VehicleCard';
import { Vehicle } from '@/hooks/useVehicles';

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Warning: 'warning',
  },
}));

describe('VehicleCard Component', () => {
  const mockVehicle: Vehicle = {
    id: 1,
    establishmentId: 1,
    companyId: 2,
    plate: 'ABC1234',
    model: 'Civic',
    color: 'Prata',
    price: 8000,
    price_formatted: 'R$ 80,00',
    discount: 1000,
    discount_formatted: 'R$ 10,00',
    created_at_formatted: '01/01/2026',
    created_at: '2026-01-01T00:00:00Z',
    services: [
      { id: 1, name: 'Lavagem Completa', price: 8000 }
    ],
    company: {
      id: 2,
      name: 'Empresa X'
    }
  };

  it('renders card elements correctly with company and discount', () => {
    const onPrint = jest.fn();
    const onDelete = jest.fn();

    const tree = renderer.create(
      <VehicleCard
        vehicle={mockVehicle}
        onPrint={onPrint}
        onDelete={onDelete}
      />
    );

    expect(tree.toJSON()).toBeDefined();
    
    // Find model and plate text
    const textNodes = tree.root.findAllByType('Text');
    const texts = textNodes.map((n) => n.children.join(''));
    
    expect(texts).toContain('Civic');
    expect(texts).toContain('• Prata');
    expect(texts).toContain('ABC1234');
    expect(texts).toContain('Empresa X');
    expect(texts).toContain('Lavagem Completa');
    
    tree.unmount();
  });

  it('triggers onPrint on print button click', () => {
    const onPrint = jest.fn();
    const onDelete = jest.fn();

    const tree = renderer.create(
      <VehicleCard
        vehicle={mockVehicle}
        onPrint={onPrint}
        onDelete={onDelete}
      />
    );

    // Find print button (touchable opacity with printer text or callback)
    const touchables = tree.root.findAll((node) => node.props.onPress !== undefined);
    
    // Let's find the print button
    const printBtn = touchables.find((t) => {
      const textNodes = t.findAllByType('Text');
      const label = textNodes.map((n) => n.children.join('')).join('');
      return label.includes('Imprimir');
    });

    expect(printBtn).toBeDefined();
    
    act(() => {
      printBtn.props.onPress();
    });

    expect(onPrint).toHaveBeenCalledWith(mockVehicle);
    tree.unmount();
  });

  it('triggers onDelete on delete button click', () => {
    const onPrint = jest.fn();
    const onDelete = jest.fn();

    const tree = renderer.create(
      <VehicleCard
        vehicle={mockVehicle}
        onPrint={onPrint}
        onDelete={onDelete}
      />
    );

    const touchables = tree.root.findAll((node) => node.props.onPress !== undefined);
    
    const deleteBtn = touchables.find((t) => {
      const textNodes = t.findAllByType('Text');
      const label = textNodes.map((n) => n.children.join('')).join('');
      return label.includes('Excluir');
    });

    expect(deleteBtn).toBeDefined();
    
    act(() => {
      deleteBtn.props.onPress();
    });

    expect(onDelete).toHaveBeenCalledWith(mockVehicle);
    tree.unmount();
  });
});
