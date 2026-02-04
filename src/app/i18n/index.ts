import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "market": "Market",
        "strategy": "Strategy",
        "risk": "Risk",
        "quantum": "Quantum",
        "bigdata": "Data",
        "model": "Workshop",
        "trade": "Trade",
        "admin": "Admin"
      },
      "market": {
        "overview": "Market Overview",
        "stocks": "Stocks",
        "futures": "Futures",
        "forex": "Forex",
        "crypto": "Crypto",
        "favorites": "Favorites",
        "symbol": "Symbol",
        "name": "Name",
        "price": "Price",
        "change": "Change",
        "volume": "Volume",
        "action": "Action",
        "trade": "Trade",
        "realtime": "Real-time"
      },
      "trade": {
        "buy": "Buy",
        "sell": "Sell",
        "orderbook": "Order Book",
        "amount": "Amount",
        "total": "Total",
        "last_price": "Last Price"
      },
      "settings": {
        "title": "Settings",
        "language": "Language",
        "market_colors": "Market Color Scheme",
        "standard": "Standard (Green Up)",
        "china": "China (Red Up)",
        "save": "Save"
      }
    }
  },
  zh: {
    translation: {
      "nav": {
        "market": "市场数据",
        "strategy": "智能策略",
        "risk": "风险管控",
        "quantum": "量子计算",
        "bigdata": "数据管理",
        "model": "量化工坊",
        "trade": "交易中心",
        "admin": "管理后台"
      },
      "market": {
        "overview": "市场概览",
        "stocks": "股票",
        "futures": "期货",
        "forex": "外汇",
        "crypto": "加密货币",
        "favorites": "自选",
        "symbol": "代码",
        "name": "名称",
        "price": "最新价",
        "change": "涨跌幅",
        "volume": "成交量",
        "action": "操作",
        "trade": "交易",
        "realtime": "实时"
      },
      "trade": {
        "buy": "买入",
        "sell": "卖出",
        "orderbook": "订单簿",
        "amount": "数量",
        "total": "累计",
        "last_price": "最新价"
      },
      "settings": {
        "title": "系统设置",
        "language": "语言切换",
        "market_colors": "行情配色方案",
        "standard": "国际标准 (绿涨红跌)",
        "china": "中国习惯 (红涨绿跌)",
        "save": "保存设置"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
