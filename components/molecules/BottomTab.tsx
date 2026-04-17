import { FONT_FAMILY } from '@constants/fonts';
import { FIND_BACK } from '@constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FALLBACK_ACTIVE_COLOR = '#7C3AED';
const FALLBACK_INACTIVE_COLOR = '#94A3B8';
const SCAN_ICON_COLOR = '#F6F0FF';

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

    return rawLabel.toUpperCase();
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
        <View style={styles.iconWrap}>{icon}</View>
        {showLabel ? (
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[styles.label, { color: tabColor }]}
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
          colors={['#5A3BDD', '#A192FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanFab}
        >
          {icon}
        </LinearGradient>
        {showLabel ? (
          <Text
            allowFontScaling={false}
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
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 25, 0.94)',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    justifyContent: 'center',
    overflow: 'visible',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 12,
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
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#5A3BDD',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 16,
  },
  label: {
    marginTop: 4,
    fontFamily: FONT_FAMILY.label,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scanLabel: {
    marginTop: 4,
  },
});
