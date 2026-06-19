import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: readonly [string, string, ...string[]];
}

export const Button: React.FC<ButtonProps> = ({
  title, variant = 'primary', size = 'md', loading = false,
  icon, style, textStyle, gradient, disabled, ...props
}) => {
  const isDisabled = disabled || loading;

  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg };
  const paddings = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };

  if (variant === 'primary' || gradient) {
    const colors = gradient ?? Colors.gradientPrimary;
    return (
      <TouchableOpacity
        {...props}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[{ borderRadius: Radius.md, overflow: 'hidden' }, style]}
      >
        <LinearGradient
          colors={colors as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { height: heights[size], paddingHorizontal: paddings[size] },
            isDisabled && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.textLight, { fontSize: fontSizes[size] }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: Colors.error + '22', borderWidth: 1, borderColor: Colors.error },
  };

  const variantTextColors: Record<string, string> = {
    secondary: Colors.text,
    outline: Colors.primary,
    ghost: Colors.textSecondary,
    danger: Colors.error,
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles[variant],
        { height: heights[size], paddingHorizontal: paddings[size], borderRadius: Radius.md },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantTextColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { fontSize: fontSizes[size], color: variantTextColors[variant] }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  textLight: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
