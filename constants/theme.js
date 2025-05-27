// Theme configuration for the app

export const colors = {
    // Primary brand colors
    primary: '#8A4FFF', // Main purple
    primaryLight: '#B18AFF',
    primaryDark: '#6A3ACC',

    // Secondary colors
    secondary: '#FF4F9A', // Pink
    secondaryLight: '#FF8AC2',
    secondaryDark: '#CC3C7B',

    // Accent colors
    accent: '#4FFFB8', // Teal
    accentLight: '#9FFFDA',
    accentDark: '#3ACC93',

    // Semantic colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Neutrals
    white: '#FFFFFF',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    black: '#000000',

    // Background colors
    background: {
        primary: '#F9FAFB',
        secondary: '#F3F4F6',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: colors.gray[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
};