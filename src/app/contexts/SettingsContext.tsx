import React, { createContext, useContext, useState } from 'react';

type ColorScheme = 'standard' | 'china';

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  getUpColor: () => string;
  getDownColor: () => string;
  getChangeColorClass: (change: number | string) => string;
  getChangeBgClass: (change: number | string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState('zh');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('china');

  const setLanguage = (lang: string) => {
    setLangState(lang);
    // Mock i18n change
    document.documentElement.lang = lang;
  };

  const getUpColor = () => (colorScheme === 'china' ? '#F56565' : '#38B2AC');
  const getDownColor = () => (colorScheme === 'china' ? '#38B2AC' : '#F56565');

  const getChangeColorClass = (change: number | string) => {
    const val = typeof change === 'string' ? parseFloat(change) : change;
    if (val > 0) return colorScheme === 'china' ? 'text-[#F56565]' : 'text-[#38B2AC]';
    if (val < 0) return colorScheme === 'china' ? 'text-[#38B2AC]' : 'text-[#F56565]';
    return 'text-[#8892B0]';
  };

  const getChangeBgClass = (change: number | string) => {
    const val = typeof change === 'string' ? parseFloat(change) : change;
    if (val > 0) return colorScheme === 'china' ? 'bg-[#F56565]/20 text-[#F56565]' : 'bg-[#38B2AC]/20 text-[#38B2AC]';
    if (val < 0) return colorScheme === 'china' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]';
    return 'bg-[#233554]/20 text-[#8892B0]';
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        colorScheme, 
        setColorScheme,
        getUpColor,
        getDownColor,
        getChangeColorClass,
        getChangeBgClass
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
