/**
 * @file src/app/i18n/index.ts
 * @description 国际化(i18n)系统 - 多语言支持 + RTL布局
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @tags i18n,internationalization,localization,RTL,typescript,critical,public
 */

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

export type Locale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'ar-SA';
export type Direction = 'ltr' | 'rtl';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: Direction;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: string;
}

export interface I18nContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, format?: string) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  isRTL: boolean;
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

// ═══════════════════════════════════════════════════════
// Locale Configuration
// ═══════════════════════════════════════════════════════

export const LOCALES: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese Simplified',
    nativeName: '简体中文',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    currency: 'CNY',
    numberFormat: 'zh-CN',
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm:ss A',
    currency: 'USD',
    numberFormat: 'en-US',
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'H:mm:ss',
    currency: 'JPY',
    numberFormat: 'ja-JP',
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: 'H:mm:ss',
    currency: 'KRW',
    numberFormat: 'ko-KR',
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    currency: 'SAR',
    numberFormat: 'ar-SA',
  },
};

// ═══════════════════════════════════════════════════════
// Translation Data
// ═══════════════════════════════════════════════════════

const translations: Record<Locale, TranslationNamespace> = {
  'zh-CN': {
    common: {
      loading: '加载中...',
      error: '发生错误',
      success: '操作成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      refresh: '刷新',
      more: '更多',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      open: '打开',
      view: '查看',
      download: '下载',
      upload: '上传',
      export: '导出',
      import: '导入',
      settings: '设置',
      help: '帮助',
      about: '关于',
    },
    nav: {
      dashboard: '仪表盘',
      market: '市场行情',
      trade: '交易中心',
      strategy: '策略中心',
      risk: '风险管理',
      model: 'AI模型',
      admin: '系统管理',
      quantum: '量子计算',
      bigdata: '大数据分析',
    },
    trade: {
      buy: '买入',
      sell: '卖出',
      hold: '持有',
      price: '价格',
      amount: '数量',
      total: '总额',
      orderBook: '订单簿',
      trades: '成交记录',
      positions: '持仓管理',
      history: '历史订单',
      openOrders: '当前委托',
      leverage: '杠杆',
      margin: '保证金',
      pnl: '盈亏',
      unrealizedPnl: '未实现盈亏',
      realizedPnl: '已实现盈亏',
    },
    strategy: {
      create: '创建策略',
      edit: '编辑策略',
      delete: '删除策略',
      run: '运行策略',
      stop: '停止策略',
      pause: '暂停策略',
      performance: '策略表现',
      metrics: '指标分析',
      backtest: '回测报告',
      liveTrading: '实盘交易',
      paperTrading: '模拟交易',
    },
    risk: {
      overview: '风险概览',
      positionRisk: '仓位风险',
      marketRisk: '市场风险',
      liquidityRisk: '流动性风险',
      var: '风险价值(VaR)',
      exposure: '敞口分析',
      correlation: '相关性矩阵',
      concentration: '集中度分析',
      alerts: '风险预警',
    },
    ai: {
      signal: 'AI信号',
      confidence: '置信度',
      prediction: '预测结果',
      modelStatus: '模型状态',
      trainingProgress: '训练进度',
      inferenceSpeed: '推理速度',
      modelAccuracy: '模型准确率',
      featureImportance: '特征重要性',
    },
    admin: {
      systemHealth: '系统健康度',
      apiIntegration: 'API集成',
      canaryRelease: '金丝雀发布',
      performanceMonitor: '性能监控',
      userManagement: '用户管理',
      auditLog: '审计日志',
      configuration: '配置管理',
      maintenance: '维护模式',
    },
    time: {
      now: '刚刚',
      minutesAgo: '{count}分钟前',
      hoursAgo: '{count}小时前',
      daysAgo: '{count}天前',
      today: '今天',
      yesterday: '昨天',
      thisWeek: '本周',
      lastWeek: '上周',
      thisMonth: '本月',
      lastMonth: '上月',
    },
    validation: {
      required: '{field}为必填项',
      minLength: '{field}至少需要{min}个字符',
      maxLength: '{field}不能超过{max}个字符',
      invalidEmail: '请输入有效的邮箱地址',
      invalidPhone: '请输入有效的手机号码',
      invalidNumber: '请输入有效的数字',
      passwordMismatch: '两次密码不一致',
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Operation successful',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      more: 'More',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      export: 'Export',
      import: 'Import',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
    },
    nav: {
      dashboard: 'Dashboard',
      market: 'Market',
      trade: 'Trade',
      strategy: 'Strategy',
      risk: 'Risk Management',
      model: 'AI Models',
      admin: 'Admin',
      quantum: 'Quantum Computing',
      bigdata: 'Big Data Analytics',
    },
    trade: {
      buy: 'Buy',
      sell: 'Sell',
      hold: 'Hold',
      price: 'Price',
      amount: 'Amount',
      total: 'Total',
      orderBook: 'Order Book',
      trades: 'Trades',
      positions: 'Positions',
      history: 'Order History',
      openOrders: 'Open Orders',
      leverage: 'Leverage',
      margin: 'Margin',
      pnl: 'P&L',
      unrealizedPnl: 'Unrealized P&L',
      realizedPnl: 'Realized P&L',
    },
    strategy: {
      create: 'Create Strategy',
      edit: 'Edit Strategy',
      delete: 'Delete Strategy',
      run: 'Run Strategy',
      stop: 'Stop Strategy',
      pause: 'Pause Strategy',
      performance: 'Performance',
      metrics: 'Metrics',
      backtest: 'Backtest Report',
      liveTrading: 'Live Trading',
      paperTrading: 'Paper Trading',
    },
    risk: {
      overview: 'Risk Overview',
      positionRisk: 'Position Risk',
      marketRisk: 'Market Risk',
      liquidityRisk: 'Liquidity Risk',
      var: 'Value at Risk (VaR)',
      exposure: 'Exposure Analysis',
      correlation: 'Correlation Matrix',
      concentration: 'Concentration Analysis',
      alerts: 'Risk Alerts',
    },
    ai: {
      signal: 'AI Signal',
      confidence: 'Confidence',
      prediction: 'Prediction',
      modelStatus: 'Model Status',
      trainingProgress: 'Training Progress',
      inferenceSpeed: 'Inference Speed',
      modelAccuracy: 'Model Accuracy',
      featureImportance: 'Feature Importance',
    },
    admin: {
      systemHealth: 'System Health',
      apiIntegration: 'API Integration',
      canaryRelease: 'Canary Release',
      performanceMonitor: 'Performance Monitor',
      userManagement: 'User Management',
      auditLog: 'Audit Log',
      configuration: 'Configuration',
      maintenance: 'Maintenance Mode',
    },
    time: {
      now: 'Just now',
      minutesAgo: '{count} min ago',
      hoursAgo: '{count} hours ago',
      daysAgo: '{count} days ago',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
    },
    validation: {
      required: '{field} is required',
      minLength: '{field} must be at least {min} characters',
      maxLength: '{field} must not exceed {max} characters',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      invalidNumber: 'Please enter a valid number',
      passwordMismatch: 'Passwords do not match',
    },
  },
  'ja-JP': {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      success: '操作が成功しました',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      filter: 'フィルター',
      sort: 'ソート',
      refresh: '更新',
      more: 'もっと見る',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      close: '閉じる',
      open: '開く',
      view: '表示',
      download: 'ダウンロード',
      upload: 'アップロード',
      export: 'エクスポート',
      import: 'インポート',
      settings: '設定',
      help: 'ヘルプ',
      about: 'について',
    },
    nav: {
      dashboard: 'ダッシュボード',
      market: '市場情報',
      trade: '取引',
      strategy: 'ストラテジー',
      risk: 'リスク管理',
      model: 'AIモデル',
      admin: '管理者',
      quantum: '量子コンピューティング',
      bigdata: 'ビッグデータ分析',
    },
    trade: {
      buy: '買い',
      sell: '売り',
      hold: '保有',
      price: '価格',
      amount: '数量',
      total: '合計',
      orderBoard: 'オーダーブック',
      trades: '取引履歴',
      positions: 'ポジション',
      history: '注文履歴',
      openOrders: '有効注文',
      leverage: 'レバレッジ',
      margin: '証拠金',
      pnl: '損益',
      unrealizedPnl: '未実現損益',
      realizedPnl: '実現損益',
    },
    strategy: {
      create: 'ストラテジー作成',
      edit: 'ストラテジー編集',
      delete: 'ストラテジー削除',
      run: 'ストラテジー実行',
      stop: 'ストラテジー停止',
      pause: 'ストラテジー一時停止',
      performance: 'パフォーマンス',
      metrics: '指標',
      backtest: 'バックテストレポート',
      liveTrading: 'ライブ取引',
      paperTrading: 'ペーパートレーディング',
    },
    risk: {
      overview: 'リスク概要',
      positionRisk: 'ポジションリスク',
      marketRisk: '市場リスク',
      liquidityRisk: '流動性リスク',
      var: 'バリューアットリスク (VaR)',
      exposure: 'エクスポージャー分析',
      correlation: '相関マトリックス',
      concentration: '集中度分析',
      alerts: 'リスクアラート',
    },
    ai: {
      signal: 'AIシグナル',
      confidence: '信頼度',
      prediction: '予測結果',
      modelStatus: 'モデルステータス',
      trainingProgress: 'トレーニング進捗',
      inferenceSpeed: '推論速度',
      modelAccuracy: 'モデル精度',
      featureImportance: '特徴量重要度',
    },
    admin: {
      systemHealth: 'システムヘルス',
      apiIntegration: 'API統合',
      canaryRelease: 'カナリアリリース',
      performanceMonitor: 'パフォーマンスモニター',
      userManagement: 'ユーザー管理',
      auditLog: '監査ログ',
      configuration: '設定管理',
      maintenance: 'メンテナンスモード',
    },
    time: {
      now: 'たった今',
      minutesAgo: '{count}分前',
      hoursAgo: '{count}時間前',
      daysAgo: '{count}日前',
      today: '今日',
      yesterday: '昨日',
      thisWeek: '今週',
      lastWeek: '先週',
      thisMonth: '今月',
      lastMonth: '先月',
    },
    validation: {
      required: '{field}は必須項目です',
      minLength: '{field}は{min}文字以上で入力してください',
      maxLength: '{field}は{max}文字以内で入力してください',
      invalidEmail: '有効なメールアドレスを入力してください',
      invalidPhone: '有効な電話番号を入力してください',
      invalidNumber: '有効な数字を入力してください',
      passwordMismatch: 'パスワードが一致しません',
    },
  },
  'ko-KR': {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '작업이 완료되었습니다',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      add: '추가',
      search: '검색',
      filter: '필터',
      sort: '정렬',
      refresh: '새로고침',
      more: '더보기',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      close: '닫기',
      open: '열기',
      view: '보기',
      download: '다운로드',
      upload: '업로드',
      export: '내보내기',
      import: '가져오기',
      settings: '설정',
      help: '도움말',
      about: '정보',
    },
    nav: {
      dashboard: '대시보드',
      market: '시장 정보',
      trade: '거래소',
      strategy: '전략 센터',
      risk: '리스크 관리',
      model: 'AI 모델',
      admin: '관리자',
      quantum: '양자 컴퓨팅',
      bigdata: '빅데이터 분석',
    },
    trade: {
      buy: '매수',
      sell: '매도',
      hold: '보유',
      price: '가격',
      amount: '수량',
      total: '합계',
      orderBook: '호가창',
      trades: '체결 내역',
      positions: '포지션',
      history: '주문 내역',
      openOrders: '미체결 주문',
      leverage: '레버리지',
      margin: '증거금',
      pnl: '손익',
      unrealizedPnl: '실현 손익',
      realizedPnl: '미실현 손익',
    },
    strategy: {
      create: '전략 생성',
      edit: '전략 편집',
      delete: '전략 삭제',
      run: '전략 실행',
      stop: '전략 중지',
      pause: '전략 일시정지',
      performance: '성과',
      metrics: '지표',
      backtest: '백테스트 리포트',
      liveTrading: '실제 거래',
      paperTrading: '모의 거래',
    },
    risk: {
      overview: '리스크 개요',
      positionRisk: '포지션 리스크',
      marketRisk: '시장 리스크',
      liquidityRisk: '유동성 리스크',
      var: 'VaR(위험 가치)',
      exposure: '노출 분석',
      correlation: '상관관계 매트릭스',
      concentration: '집중도 분석',
      alerts: '리스크 알림',
    },
    ai: {
      signal: 'AI 신호',
      confidence: '신뢰도',
      prediction: '예측 결과',
      modelStatus: '모델 상태',
      trainingProgress: '학습 진행률',
      inferenceSpeed: '추론 속도',
      modelAccuracy: '모델 정확도',
      featureImportance: '특성 중요도',
    },
    admin: {
      systemHealth: '시스템 건강 상태',
      apiIntegration: 'API 통합',
      canaryRelease: '카나리 릴리스',
      performanceMonitor: '성능 모니터',
      userManagement: '사용자 관리',
      auditLog: '감사 로그',
      configuration: '구성 관리',
      maintenance: '유지보수 모드',
    },
    time: {
      now: '방금',
      minutesAgo: '{count}분 전',
      hoursAgo: '{count}시간 전',
      daysAgo: '{count}일 전',
      today: '오늘',
      yesterday: '어제',
      thisWeek: '이번 주',
      lastWeek: '지난 주',
      thisMonth: '이번 달',
      lastMonth: '지난 달',
    },
    validation: {
      required: '{field}(은)는 필수 항목입니다',
      minLength: '{field}(은)는 최소 {min}자 이상이어야 합니다',
      maxLength: '{field}(은)는 최대 {max}자를 초과할 수 없습니다',
      invalidEmail: '유효한 이메일 주소를 입력해주세요',
      invalidPhone: '유효한 전화번호를 입력해주세요',
      invalidNumber: '유효한 숫자를 입력해주세요',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
    },
  },
  'ar-SA': {
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تمت العملية بنجاح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      refresh: 'تحديث',
      more: 'المزيد',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق',
      open: 'فتح',
      view: 'عرض',
      download: 'تنزيل',
      upload: 'رفع',
      export: 'تصدير',
      import: 'استيراد',
      settings: 'الإعدادات',
      help: 'المساعدة',
      about: 'حول',
    },
    nav: {
      dashboard: 'لوحة التحكم',
      market: 'السوق',
      trade: 'التداول',
      strategy: 'الاستراتيجيات',
      risk: 'إدارة المخاطر',
      model: 'نماذج الذكاء الاصطناعي',
      admin: 'الإدارة',
      quantum: 'الحوسبة الكمومية',
      bigdata: 'تحليل البيانات الضخمة',
    },
    trade: {
      buy: 'شراء',
      sell: 'بيع',
      hold: 'حيازة',
      price: 'السعر',
      amount: 'الكمية',
      total: 'المجموع',
      orderBook: 'دفتر الأوامر',
      trades: 'الصفقات',
      positions: 'المراكز',
      history: 'سجل الطلبات',
      openOrders: 'الطلبات المفتوحة',
      leverage: 'الرافعة المالية',
      margin: 'الهامش',
      pnl: 'الربح والخسارة',
      unrealizedPnl: 'الربح/الخسارة غير المحقق',
      realizedPnl: 'الربح/الخسارة المحقق',
    },
    strategy: {
      create: 'إنشاء استراتيجية',
      edit: 'تعديل الاستراتيجية',
      delete: 'حذف الاستراتيجية',
      run: 'تشغيل الاستراتيجية',
      stop: 'إيقاف الاستراتيجية',
      pause: 'إيقاف مؤقت للاستراتيجية',
      performance: 'الأداء',
      metrics: 'المؤشرات',
      backlog: 'تقرير الاختبار الخلفي',
      liveTrading: 'التداول الفعلي',
      paperTrading: 'التداول التجريبي',
    },
    risk: {
      overview: 'نظرة عامة على المخاطر',
      positionRisk: 'مخاطر المراكز',
      marketRisk: 'مخاطر السوق',
      liquidityRisk: 'مخاطر السيولة',
      var: 'القيمة المعرضة للمخاطر (VaR)',
      exposure: 'تحليل التعرض',
      correlation: 'مصفوفة الارتباط',
      concentration: 'تحليل التركز',
      alerts: 'تنبيهات المخاطر',
    },
    ai: {
      signal: 'إشارة الذكاء الاصطناعي',
      confidence: 'مستوى الثقة',
      prediction: 'نتيجة التنبؤ',
      modelStatus: 'حالة النموذج',
      trainingProgress: 'تقدم التدريب',
      inferenceSpeed: 'سرعة الاستنتاج',
      modelAccuracy: 'دقة النموذج',
      featureImportance: 'أهمية الميزة',
    },
    admin: {
      systemHealth: 'صحة النظام',
      apiIntegration: 'تكامل API',
      canaryRelease: 'الإصدار الكناري',
      performanceMonitor: 'مراقبة الأداء',
      userManagement: 'إدارة المستخدمين',
      auditLog: 'سجل التدقيق',
      configuration: 'إدارة الإعدادات',
      maintenance: 'وضع الصيانة',
    },
    time: {
      now: 'الآن',
      minutesAgo: 'منذ {count} دقيقة',
      hoursAgo: 'منذ {count} ساعة',
      daysAgo: 'منذ {count} يوم',
      today: 'اليوم',
      yesterday: 'أمس',
      thisWeek: 'هذا الأسبوع',
      lastWeek: 'الأسبوع الماضي',
      thisMonth: 'هذا الشهر',
      lastMonth: 'الشهر الماضي',
    },
    validation: {
      required: '{field} مطلوب',
      minLength: '{field} يجب أن يكون على الأقل {min} حرف',
      maxLength: '{field} يجب أن لا يتجاوز {max} حرف',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صالح',
      invalidPhone: 'يرجى إدخال رقم هاتف صالح',
      invalidNumber: 'يرجى إدخال رقم صالح',
      passwordMismatch: 'كلمات المرور غير متطابقة',
    },
  },
};

// ═══════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════

function getNestedValue(obj: TranslationNamespace, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'zh-CN';

  const stored = localStorage.getItem('yyc3-locale');
  if (stored && stored in LOCALES) {
    return stored as Locale;
  }

  const browserLang = navigator.language;
  if (browserLang in LOCALES) {
    return browserLang as Locale;
  }

  return 'zh-CN';
}

// ═══════════════════════════════════════════════════════
// I18n Context Provider
// ═══════════════════════════════════════════════════════

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  const config = LOCALES[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = config.direction;

    localStorage.setItem('yyc3-locale', locale);
  }, [locale, config.direction]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key);

    if (!translation) {
      // Fallback to English
      const fallbackTranslation = getNestedValue(translations['en-US'], key);
      if (fallbackTranslation) {
        return interpolate(fallbackTranslation, params);
      }
      // Return key as last resort
      return interpolate(key, params);
    }

    return interpolate(translation, params);
  }, [locale]);

  const formatDate = useCallback((date: Date | string | number, _format?: string): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch {
      return dateObj.toLocaleDateString();
    }
  }, [locale, config.dateFormat]);

  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(config.numberFormat as string, options).format(num);
    } catch {
      return num.toLocaleString();
    }
  }, [config.numberFormat]);

  const formatCurrency = useCallback((amount: number, currency?: string): string => {
    const curr = currency || config.currency;

    try {
      return new Intl.NumberFormat(config.numberFormat as string, {
        style: 'currency',
        currency: curr,
      }).format(amount);
    } catch {
      return `${curr} ${amount.toFixed(2)}`;
    }
  }, [config.currency, config.numberFormat]);

  const value: I18nContextType = {
    locale,
    direction: config.direction,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL: config.direction === 'rtl',
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════
// Custom Hook
// ═══════════════════════════════════════════════════════

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}

// ═══════════════════════════════════════════════════════
// Export Utilities
// ═══════════════════════════════════════════════════════

export function getDirection(locale: Locale): Direction {
  return LOCALES[locale].direction;
}

export function getAvailableLocales(): Locale[] {
  return Object.keys(LOCALES) as Locale[];
}

export function isRTLLocale(locale: Locale): boolean {
  return LOCALES[locale].direction === 'rtl';
}
