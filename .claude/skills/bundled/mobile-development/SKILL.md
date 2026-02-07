# Mobile Development Skill

Patterns and best practices for React Native and mobile app development.

## React Native Patterns

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── atoms/        # Basic elements (Button, Text, Input)
│   ├── molecules/    # Composite components
│   └── organisms/    # Complex sections
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── hooks/            # Custom hooks
├── services/         # API and external services
├── store/            # State management
├── utils/            # Utilities
├── constants/        # App constants
└── types/            # TypeScript types
```

### Navigation Setup (React Navigation 6+)

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

// navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
```

### Typed Navigation Hook

```typescript
// hooks/useAppNavigation.ts
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export const useAppNavigation = () => {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};
```

## Component Patterns

### Platform-Specific Components

```typescript
// components/PlatformButton.tsx
import { Platform, Pressable, TouchableOpacity } from 'react-native';

export const PlatformButton = Platform.select({
  ios: TouchableOpacity,
  android: Pressable,
  default: Pressable,
});
```

### Responsive Design

```typescript
// utils/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone 11 Pro

export const wp = (percentage: number) => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

export const hp = (percentage: number) => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

export const scale = (size: number) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};
```

### Safe Area Handling

```typescript
// components/SafeScreen.tsx
import { SafeAreaView, StyleSheet, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps extends ViewProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeScreen({ children, edges = ['top'], style, ...props }: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

## State Management

### Zustand Store Pattern

```typescript
// store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## API Integration

### React Query Setup

```typescript
// services/api.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
}
```

## Performance Patterns

### Optimized FlatList

```typescript
// components/OptimizedList.tsx
import { FlatList, FlatListProps } from 'react-native';
import { useCallback } from 'react';

interface OptimizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (item: T) => React.ReactElement;
}

export function OptimizedList<T extends { id: string }>({
  data,
  renderItem,
  ...props
}: OptimizedListProps<T>) {
  const keyExtractor = useCallback((item: T) => item.id, []);

  const renderItemCallback = useCallback(
    ({ item }: { item: T }) => renderItem(item),
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItemCallback}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      {...props}
    />
  );
}
```

### Image Caching

```typescript
// components/CachedImage.tsx
import FastImage, { FastImageProps } from 'react-native-fast-image';

interface CachedImageProps extends FastImageProps {
  uri: string;
}

export function CachedImage({ uri, style, ...props }: CachedImageProps) {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={style}
      {...props}
    />
  );
}
```

## Expo Patterns

### Config Plugins

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyApp',
  slug: 'my-app',
  version: '1.0.0',
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access camera',
      },
    ],
  ],
});
```

### EAS Build Commands

```bash
# Development build
eas build --profile development --platform ios

# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Testing Patterns

### Component Testing with RNTL

```typescript
// __tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Click me</Button>
    );

    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## Common Gotchas

| Issue | Solution |
|-------|----------|
| Keyboard covers input | Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view` |
| Android back button | Handle with `BackHandler` or navigation listeners |
| Deep linking not working | Check URL scheme config in app.json |
| Slow list rendering | Use `FlatList` with proper optimization props |
| Memory leaks | Clean up subscriptions in `useEffect` cleanup |
