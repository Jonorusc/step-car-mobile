import React from 'react';
import renderer, { act } from 'react-test-renderer';
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

describe('WebStyleDrawer Component Triggers', () => {
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

  it('triggers navigation callback on item tap', () => {
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    
    let tree: any;
    act(() => {
      tree = renderer.create(
        <WebStyleDrawer
          isOpen={true}
          onClose={onClose}
          activeRoute="index"
          onNavigate={onNavigate}
        />
      );
    });

    // Find all touchables by searching for onPress prop
    const touchables = tree.root.findAll((node: any) => node.props.onPress !== undefined);
    
    // Let's find the Categories item by looking for the one that has label 'Categorias'
    const categoriesItem = touchables.find((t: any) => {
      const textNodes = t.findAllByType('Text');
      const label = textNodes.map((n: any) => n.children.join('')).join('');
      return label.includes('Categorias');
    });
    
    act(() => {
      categoriesItem.props.onPress();
    });

    expect(onNavigate).toHaveBeenCalledWith('categories');
    expect(onClose).toHaveBeenCalled();
    
    act(() => {
      tree.unmount();
    });
  });
});
