import { FONT_FAMILY } from '@constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIND_BACK } from '@constants/theme';

const FALLBACK_ACTIVE_COLOR = FIND_BACK.primary;
const FALLBACK_INACTIVE_COLOR = FIND_BACK.mutedText;
const SCAN_ICON_COLOR = FIND_BACK.bodyText;

function BottomTabBarInner({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index];
  const tabBarStyle = descriptors[focusedRoute.key]?.options?.tabBarStyle as
    | { display?: string; height?: number }
    | undefined;
  const activeTintColor =
    (descriptors[focusedRoute.key]?.options?.tabBarActiveTintColor as string | undefined) ??
    FALLBACK_ACTIVE_COLOR;
  const inactiveTintColor =
    (descriptors[focusedRoute.key]?.options?.tabBarInactiveTintColor as string | undefined) ??
    FALLBACK_INACTIVE_COLOR;

  if (tabBarStyle?.display === 'none' || tabBarStyle?.height === 0) {
    return null;
  }

  const routeIndexByKey = new Map(state.routes.map((route, index) => [route.key, index]));
  const scanRoute = state.routes.find(route => route.name === 'Scan');
  const regularRoutes = state.routes.filter(route => route.name !== 'Scan');
  const splitIndex = Math.ceil(regularRoutes.length / 2);
  const leftRoutes = regularRoutes.slice(0, splitIndex);
  const rightRoutes = regularRoutes.slice(splitIndex);

  const getLabelText = (routeKey: string, routeName: string) => {
    const options = descriptors[routeKey]?.options;
    const labelFromOptions = options?.tabBarLabel;

    const rawLabel =
      typeof labelFromOptions === 'string'
        ? labelFromOptions
        : options?.title !== undefined
          ? String(options.title)
          : routeName;

    return rawLabel;
  };

  const createTabHandlers = (routeKey: string, routeName: string, isFocused: boolean) => {
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName as never);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: routeKey,
      });
    };

    return { onPress, onLongPress };
  };

  const renderRegularTab = (route: (typeof state.routes)[number]) => {
    const { options } = descriptors[route.key];
    const routeIndex = routeIndexByKey.get(route.key) ?? 0;
    const isFocused = state.index === routeIndex;
    const tabColor = isFocused ? activeTintColor : inactiveTintColor;
    const icon = options.tabBarIcon?.({ focused: isFocused, color: tabColor, size: 18 });
    const labelText = getLabelText(route.key, route.name);
    const showLabel = options.tabBarShowLabel !== false;
    const { onPress, onLongPress } = createTabHandlers(route.key, route.name, isFocused);

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? labelText}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabButton}
      >
        <View style={[styles.iconWrap, isFocused ? styles.iconWrapActive : null]}>{icon}</View>
        {showLabel ? (
          <Text
            numberOfLines={1}
            style={[styles.label, { color: tabColor }, isFocused ? styles.activeLabel : null]}
          >
            {labelText}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const renderScanTab = () => {
    if (!scanRoute) {
      return null;
    }

    const { options } = descriptors[scanRoute.key];
    const routeIndex = routeIndexByKey.get(scanRoute.key) ?? 0;
    const isFocused = state.index === routeIndex;
    const icon = options.tabBarIcon?.({ focused: isFocused, color: SCAN_ICON_COLOR, size: 25 });
    const labelText = getLabelText(scanRoute.key, scanRoute.name);
    const showLabel = options.tabBarShowLabel !== false;
    const { onPress, onLongPress } = createTabHandlers(scanRoute.key, scanRoute.name, isFocused);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? labelText}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.scanTabButton}
      >
        <LinearGradient
          colors={[FIND_BACK.primary, FIND_BACK.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanFab}
        >
          {icon}
        </LinearGradient>
        {showLabel ? (
          <Text
            numberOfLines={1}
            style={[styles.label, styles.scanLabel, { color: inactiveTintColor }]}
          >
            {labelText}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.shell}>
        <View style={styles.row}>
          {leftRoutes.map(renderRegularTab)}
          <View style={styles.centerGap} />
          {rightRoutes.map(renderRegularTab)}
        </View>
        {renderScanTab()}
      </View>
    </View>
  );
}

BottomTabBarInner.displayName = 'BottomTabBar';

export const BottomTabBar = memo(BottomTabBarInner);

const styles = StyleSheet.create({
  outer: {
    backgroundColor: FIND_BACK.canvas,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  shell: {
    height: 82,
    borderRadius: 26,
    backgroundColor: FIND_BACK.glassBackground,
    borderWidth: 1,
    borderColor: 'rgba(142, 108, 255, 0.22)',
    justifyContent: 'center',
    overflow: 'visible',
    shadowColor: FIND_BACK.neutral,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 12,
  },
  tabButton: {
    minWidth: 56,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(108, 76, 241, 0.18)',
  },
  centerGap: {
    width: 72,
  },
  scanTabButton: {
    position: 'absolute',
    top: -32,
    left: '50%',
    transform: [{ translateX: -32 }],
    alignItems: 'center',
  },
  scanFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FIND_BACK.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.48,
    shadowRadius: 16,
    elevation: 18,
  },
  label: {
    marginTop: 4,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  activeLabel: {
    fontFamily: FONT_FAMILY.bold,
  },
  scanLabel: {
    marginTop: 4,
  },
});
