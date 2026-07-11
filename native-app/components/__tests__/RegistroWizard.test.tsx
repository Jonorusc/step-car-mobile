import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import RegistroWizard from '../RegistroWizard';

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Warning: 'warning',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [
      { id: 1, name: 'Lavagem Simples' }
    ],
    isLoading: false,
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    activeEstablishment: { id: 1, name_by_company: 'Test Estb' },
  }),
}));

describe('RegistroWizard Component', () => {
  it('renders Step 1 inputs correctly', () => {
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    const tree = renderer.create(
      <RegistroWizard
        visible={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(tree.toJSON()).toBeDefined();

    // Check Step 1 Elements
    const inputs = tree.root.findAllByType(TextInput);
    expect(inputs.length).toBe(2); // Plate, Model

    tree.unmount();
  });
});
