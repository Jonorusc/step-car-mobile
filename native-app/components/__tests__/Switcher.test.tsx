import React from 'react';
import renderer from 'react-test-renderer';
import EstablishmentSwitcher from '../EstablishmentSwitcher';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('EstablishmentSwitcher Component', () => {
  const mockActive = {
    id: 1,
    user_id: 10,
    name_by_company: 'Active Est',
    document: '11.111.111/0001-11',
    type: 'CAR_WASH_AND_PARKING',
    cor_system: '#FF5733',
    active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  };

  const mockList = [mockActive];

  it('renders correctly with active establishment', () => {
    const onSelect = jest.fn();
    const tree = renderer
      .create(
        <EstablishmentSwitcher
          active={mockActive}
          list={mockList}
          onSelect={onSelect}
        />
      )
      .toJSON();
    expect(tree).toBeDefined();
  });
});
