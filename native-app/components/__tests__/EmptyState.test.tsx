import React from 'react';
import renderer from 'react-test-renderer';
import NoEstablishmentEmptyState from '../NoEstablishmentEmptyState';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('NoEstablishmentEmptyState Component', () => {
  it('renders correctly', () => {
    const onLogout = jest.fn();
    const tree = renderer
      .create(
        <NoEstablishmentEmptyState
          onLogout={onLogout}
          isLoggingOut={false}
        />
      )
      .toJSON();
    expect(tree).toBeDefined();
  });
});
