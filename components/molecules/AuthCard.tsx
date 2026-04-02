import { cn } from '@/lib/cn';
import { memo, forwardRef, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

export interface AuthCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

/**
 * Glass-style container for Login / Register stacks.
 */
const AuthCardInner = forwardRef<View, AuthCardProps>(function AuthCard(
  { children, className, ...rest },
  ref
) {
  return (
    <View
      ref={ref}
      className={cn(
        'rounded-fb-lg border border-fb-border-glass bg-fb-surface/75 p-5 shadow-lg',
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
});

AuthCardInner.displayName = 'AuthCard';

export const AuthCard = memo(AuthCardInner);
