import { cn } from '@/lib/cn';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo } from 'react';
import { FIND_BACK } from '@constants/theme';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function BottomTabBarInner({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index];
  const tabBarStyle = descriptors[focusedRoute.key]?.options?.tabBarStyle as
    | { display?: string; height?: number }
    | undefined;

  if (tabBarStyle?.display === 'none' || tabBarStyle?.height === 0) {
    return null;
  }

  return (
    <View
      className="border-t border-white/10 bg-fb-neutral/95 px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8 }}
    >
      <View className="mx-1 flex-row items-center justify-between rounded-full border border-fb-border-glass bg-fb-surface-elevated/90 px-1 py-1.5">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const color = isFocused ? FIND_BACK.bodyText : FIND_BACK.mutedText;
          const icon = options.tabBarIcon?.({ focused: isFocused, color, size: 22 });

          const labelFromOptions = options.tabBarLabel;
          const labelText =
            typeof labelFromOptions === 'string'
              ? labelFromOptions
              : options.title !== undefined
                ? String(options.title)
                : route.name;

          const showLabel = options.tabBarShowLabel !== false;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? labelText}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="min-w-[56px] flex-1 items-center justify-center py-1"
            >
              <View
                className={cn(
                  'items-center justify-center rounded-full p-2',
                  isFocused && 'bg-fb-primary shadow-fb-glow'
                )}
              >
                {icon}
              </View>
              {showLabel ? (
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  className={cn(
                    'mt-0.5 text-center font-sans text-caption-default',
                    isFocused ? 'text-fb-primary' : 'text-fb-muted'
                  )}
                >
                  {labelText}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

BottomTabBarInner.displayName = 'BottomTabBar';

export const BottomTabBar = memo(BottomTabBarInner);
