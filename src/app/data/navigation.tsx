import React from 'react';

// Define icons inline to ensure they are valid React components and avoid circular dependency or import issues
const TrendingUp = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ShieldAlert = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>;
const Cpu = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const Zap = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Settings = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const Layers = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const Database = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const Atom = (props: any) => (
  <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20M2 12h20" />
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const MODULES = [
  { id: 'market', name: '市场数据', icon: TrendingUp },
  { id: 'strategy', name: '智能策略', icon: Cpu },
  { id: 'risk', name: '风险管控', icon: ShieldAlert },
  { id: 'quantum', name: '量子计算', icon: Atom },
  { id: 'bigdata', name: '数据管理', icon: Database },
  { id: 'model', name: '量化工坊', icon: Layers },
  { id: 'trade', name: '交易中心', icon: Zap },
  { id: 'admin', name: '管理后台', icon: Settings },
];

export const MENUS: Record<string, any[]> = {
  market: [
    { id: 'live', name: '实时行情', sub: ['全球行情', '自选面板', 'K线分析', '行情联动'] },
    { id: 'history', name: '历史数据', sub: ['多维筛选', '双模展示', '指标对比', '批量导出'] },
    { id: 'insight', name: '智能洞察', sub: ['趋势分析', '异常检测', '关联分析', '数据预警'] },
    { id: 'board', name: '自主看板', sub: ['组件中心', '布局设计', '保存分享', '多屏适配'] },
    { id: 'fav', name: '数据收藏', sub: ['数据收藏', '跨端同步', '数据订阅'] },
  ],
  strategy: [
    { id: 'edit', name: '策略编辑', sub: ['图形编辑', '代码编辑', '智能生成', '组件中心', '模板工具'] },
    { id: 'backtest', name: '智能回测', sub: ['回测设置', '数据回测', '报告生成', '结果对比'] },
    { id: 'optimize', name: '策略优化', sub: ['参数优化', 'AI优化', '量子优化', '历史记录'] },
    { id: 'sim', name: '模拟交易', sub: ['模拟设置', '执行监控', '交易分析', '实盘切换'] },
    { id: 'manage', name: '策略管理', sub: ['分类搜索', '版本管理', '分享导入', '权限设置'] },
  ],
  risk: [
    { id: 'quantum_risk', name: '量子风险计算', sub: ['VaR计算', '组合优化', '参数设置', '结果可视'] },
    { id: 'bigdata_risk', name: '大数据风控', sub: ['组合分析', '压力测试', '情景分析', '指标监控'] },
    { id: 'live_risk', name: '实时风控', sub: ['资产监控', '策略监控', '交易监控', '全局看板'] },
    { id: 'warning', name: '风险预警控制', sub: ['预警设置', '通知方式', '自动风控', '手动操作'] },
    { id: 'report', name: '风控报告', sub: ['实时报告', '历史分析', '优化建议', '导出分享'] },
    { id: 'hedging', name: '对冲工具库', sub: ['传统对冲', 'AI对冲', '效果监控'] },
  ],
  quantum: [
    { id: 'resource', name: '资源监控', sub: ['算力监控', '任务队列', '性能指标', '资源调度'] },
    { id: 'algo', name: '算法配置', sub: ['算法库', '参数设置', '融合配置', '任务提交'] },
    { id: 'app', name: '量化应用', sub: ['策略优化', '风险计算', '行情预测', '模型训练'] },
    { id: 'analysis', name: '结果分析', sub: ['结果可视', '算法对比', '性能分析', '结果应用'] },
    { id: 'security', name: '加密安全', sub: ['密钥管理', '数据加密', '安全监控', '强度分析'] },
    { id: 'workshop', name: '实验工坊', sub: ['自定义任务', '算法调试', '实验记录', '应用案例'] },
  ],
  bigdata: [
    { id: 'manage', name: '数据管理', sub: ['主流源', '配置测试', '状态监控', '自定义接入'] },
    { id: 'collection', name: '采集清洗', sub: ['实时采集', '数据清洗', '格式转换', '任务监控'] },
    { id: 'storage', name: '存储管理', sub: ['状态监控', '存储分析', '数据归档', '备份恢复'] },
    { id: 'process', name: '数据处理', sub: ['任务调度', '流程设计', '资源监控', '结果缓存'] },
    { id: 'quality', name: '质量监控', sub: ['质量指标', '异常检测', '质量报告', '优化建议'] },
    { id: 'share', name: '数据共享', sub: ['资源库', '权限控制', '接口管理', '使用统计'] },
  ],
  model: [
    { id: 'library', name: '模型库', sub: ['经典模型', 'AI模型', '量子模型', '分类搜索'] },
    { id: 'train', name: '智能训练', sub: ['数据选择', '参数设置', '量子加速', '进度监控'] },
    { id: 'eval', name: '模型评估', sub: ['指标评估', '回测评估', '模型对比', '鲁棒测试'] },
    { id: 'deploy', name: '部署监控', sub: ['在线部署', '性能监控', '版本管理', '失效预警'] },
    { id: 'dev', name: '自主开发', sub: ['开发框架', '组件库', '调试测试', '导入导出'] },
    { id: 'app', name: '模型应用', sub: ['对接策略', '行情分析', '对接风控', '效果统计'] },
  ],
  trade: [
    { id: 'real', name: '实盘交易', sub: ['资产监控', '手动交易', '自动交易', '委托记录', '资产穿透'] },
    { id: 'sim', name: '模拟交易', sub: ['账户配置', '交易监控', '记录分析', '实盘切换'] },
    { id: 'plan', name: '交易计划', sub: ['计划设置', '条件挂单', '挂单管理', '执行监控'] },
    { id: 'logs', name: '日志统计', sub: ['作日志', '交易统计', '报告生成', '记录备份'] },
    { id: 'config', name: '交易配置', sub: ['接口配置', '参数设置', '风控设置', '异常处理'] },
  ],
  admin: [
    { id: 'sys', name: '系统配置', sub: ['基础配置', '数据配置', '通知配置', '量子配置'] },
    { id: 'auth', name: '权限管理', sub: ['用户管理', '角色管理', '权限分配', '团队管理'] },
    { id: 'monitor', name: '日志监控', sub: ['操作日志', '错误日志', '性能日志', '日志管理'] },
    { id: 'backup', name: '数据备份', sub: ['全局备份', '数据恢复', '数据清理', '幂等审核'] },
    { id: 'plugin', name: '模块插件', sub: ['模块管理', '插件管理', '接口管理', '系统更新'] },
    { id: 'screen', name: '大屏监控', sub: ['全局监控', '实时监控', '预警大屏', '多屏联动'] },
  ]
};
