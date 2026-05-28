import React from 'react';
import renderer from 'react-test-renderer';
import { Animated } from 'react-native';

// Force evaluate Animated to prevent lazy load during teardown
const _forceAnimated = Animated.Value;

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback?: any) => callback && callback({ finished: true }),
  stop: () => {},
  reset: () => {},
}));

import WebStyleDrawer from '../WebStyleDrawer';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/useUser', () => () => ({
  name: 'Test Operator',
}));

jest.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    setActiveEstablishment: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuthStore: () => ({
    logout: jest.fn(),
  }),
}));

describe('WebStyleDrawer Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly when open', () => {
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    
    const tree = renderer.create(
      <WebStyleDrawer
        isOpen={true}
        onClose={onClose}
        activeRoute="index"
        onNavigate={onNavigate}
      />
    );
      
    expect(tree.toJSON()).toBeDefined();
    tree.unmount();
  });

  it('returns null when closed', () => {
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    
    const tree = renderer.create(
      <WebStyleDrawer
        isOpen={false}
        onClose={onClose}
        activeRoute="index"
        onNavigate={onNavigate}
      />
    );
      
    expect(tree.toJSON()).toBeNull();
    tree.unmount();
  });
});
