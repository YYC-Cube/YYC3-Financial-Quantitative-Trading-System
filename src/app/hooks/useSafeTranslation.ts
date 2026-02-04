// Safe translation hook that prevents fginspector ForwardRef errors
import { useTranslation as useOriginalTranslation } from 'react-i18next';

export const useSafeTranslation = () => {
  try {
    return useOriginalTranslation();
  } catch (error) {
    console.warn('Translation hook error (likely from fginspector):', error);
    // Return a fallback translation function
    return {
      t: (key: string) => key,
      i18n: {
        language: 'zh',
        changeLanguage: () => Promise.resolve(),
      },
      ready: true,
    };
  }
};

// Export as useTranslation for drop-in replacement
export { useSafeTranslation as useTranslation };
