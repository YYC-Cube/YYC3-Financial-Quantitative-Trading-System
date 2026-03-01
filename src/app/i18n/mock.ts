// Mock i18n to avoid fginspector ForwardRef errors
// This is a temporary workaround that provides translation functionality without external dependencies

let currentLanguage = 'zh';

interface TranslationMap {
  [key: string]: string | TranslationMap;
}

const translations: Record<string, TranslationMap> = {
  en: {
    nav: {
      market: "Market",
      strategy: "Strategy",
      risk: "Risk",
      quantum: "Quantum",
      bigdata: "Data",
      model: "Workshop",
      trade: "Trade",
      admin: "Admin"
    },
    market: {
      overview: "Market Overview",
      stocks: "Stocks",
      futures: "Futures",
      forex: "Forex",
      crypto: "Crypto",
      favorites: "Favorites",
      symbol: "Symbol",
      name: "Name",
      price: "Price",
      change: "Change",
      volume: "Volume",
      action: "Action",
      trade: "Trade",
      realtime: "Real-time"
    },
    settings: {
      title: "Settings",
      language: "Language",
      market_colors: "Market Color Scheme",
      standard: "Standard (Green Up)",
      china: "China (Red Up)",
      save: "Save"
    }
  },
  zh: {
    nav: {
      market: "市场数据",
      strategy: "智能策略",
      risk: "风险管控",
      quantum: "量子计算",
      bigdata: "数据管理",
      model: "量化工坊",
      trade: "交易中心",
      admin: "管理后台"
    },
    market: {
      overview: "市场概览",
      stocks: "股票",
      futures: "期货",
      forex: "外汇",
      crypto: "加密货币",
      favorites: "自选",
      symbol: "代码",
      name: "名称",
      price: "最新价",
      change: "涨跌幅",
      volume: "成交量",
      action: "操作",
      trade: "交易",
      realtime: "实时"
    },
    settings: {
      title: "系统设置",
      language: "语言切换",
      market_colors: "行情配色方案",
      standard: "国际标准 (绿涨红跌)",
      china: "中国习惯 (红涨绿跌)",
      save: "保存设置"
    }
  }
};

function translate(key: string): string {
  const keys = key.split('.');
  let value: string | TranslationMap | undefined = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export function useTranslation() {
  return {
    t: translate,
    i18n: {
      language: currentLanguage,
      changeLanguage: (lng: string) => {
        currentLanguage = lng;
        return Promise.resolve();
      }
    },
    ready: true
  };
}

export default {
  language: currentLanguage,
  changeLanguage: (lng: string) => {
    currentLanguage = lng;
  }
};