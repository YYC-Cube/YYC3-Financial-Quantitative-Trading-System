import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface CreativeAsset {
  id: string;
  type: 'text' | 'image_prompt' | 'color_palette' | 'layout' | 'copywriting';
  content: string;
  style: string;
  format: string;
  metadata?: Record<string, any>;
}

export interface CreativeRequest {
  prompt: string;
  type: 'marketing' | 'report' | 'social' | 'presentation' | 'branding' | 'general';
  tone: 'professional' | 'casual' | 'creative' | 'technical' | 'inspiring';
  targetAudience?: string;
  language?: string;
  variations?: number;
}

export interface CreativeResult {
  assets: CreativeAsset[];
  prompt: string;
  style: string;
  variations: number;
  processingTimeMs: number;
}

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface LayoutTemplate {
  name: string;
  description: string;
  sections: { name: string; width: string; height: string }[];
}

const MARKETING_TEMPLATES: Record<string, { headline: string; body: string; cta: string }[]> = {
  strategy_launch: [
    { headline: '智能量化策略，稳健增值之路', body: '基于先进AI算法，为您量身打造专属交易策略', cta: '立即体验' },
    { headline: '数据驱动，洞悉市场先机', body: '毫秒级数据分析，精准捕捉交易信号', cta: '免费试用' },
    { headline: '量化交易新纪元，从YYC³开始', body: '8大AI专家协同，为您保驾护航', cta: '开启之旅' }
  ],
  risk_alert: [
    { headline: '智能风控，守护每一笔投资', body: '实时监测异常波动，毫秒级止损响应', cta: '了解详情' },
    { headline: '风险可视化，决策更从容', body: '全方位风险评估仪表盘，投资安全看得见', cta: '查看方案' }
  ],
  education: [
    { headline: '从零到量化高手，只需30天', body: '系统化课程 + 实战演练 + AI教练陪伴', cta: '开始学习' },
    { headline: '大师级交易思维，人人可学', body: '顶级量化策略，AI拆解为您量身定制', cta: '免费报名' }
  ]
};

const COLOR_PALETTES: ColorPalette[] = [
  { name: '金融科技蓝', primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B', background: '#0F172A', text: '#F8FAFC' },
  { name: '财富增长绿', primary: '#059669', secondary: '#10B981', accent: '#F97316', background: '#022C22', text: '#ECFDF5' },
  { name: '专业沉稳灰', primary: '#374151', secondary: '#6B7280', accent: '#EF4444', background: '#111827', text: '#F9FAFB' },
  { name: '创新科技紫', primary: '#7C3AED', secondary: '#A78BFA', accent: '#06B6D4', background: '#1E1B4B', text: '#EDE9FE' },
  { name: '高端金色', primary: '#B45309', secondary: '#D97706', accent: '#1D4ED8', background: '#1C1917', text: '#FEF3C7' }
];

const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { name: '单栏居中', description: '适合长文内容', sections: [{ name: 'header', width: '100%', height: '80px' }, { name: 'content', width: '80%', height: 'auto' }, { name: 'footer', width: '100%', height: '60px' }] },
  { name: '双栏布局', description: '适合对比展示', sections: [{ name: 'header', width: '100%', height: '80px' }, { name: 'left', width: '50%', height: 'auto' }, { name: 'right', width: '50%', height: 'auto' }] },
  { name: '仪表盘网格', description: '适合数据展示', sections: [{ name: 'sidebar', width: '20%', height: '100%' }, { name: 'main', width: '60%', height: '100%' }, { name: 'right', width: '20%', height: '100%' }] }
];

export class GraceCreativeService {
  private generationHistory: Map<string, CreativeResult[]> = new Map();

  constructor() {
    console.log('🎨 创想·灵韵 Grace Creative Service initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<CreativeResult> {
    const startTime = Date.now();
    const creativeReq = this.parseCreativeRequest(request);
    const assets = await this.generateAssets(creativeReq);

    const result: CreativeResult = {
      assets,
      prompt: creativeReq.prompt,
      style: creativeReq.tone,
      variations: creativeReq.variations || 1,
      processingTimeMs: Date.now() - startTime
    };

    this.recordGeneration(request.userId, result);
    console.log(`🎨 [Grace] Generated ${assets.length} creative assets`);

    return result;
  }

  getColorPalettes(): ColorPalette[] {
    return COLOR_PALETTES;
  }

  getLayoutTemplates(): LayoutTemplate[] {
    return LAYOUT_TEMPLATES;
  }

  getMarketingCopy(category: string): { headline: string; body: string; cta: string }[] {
    return MARKETING_TEMPLATES[category] || MARKETING_TEMPLATES.strategy_launch;
  }

  generateImagePrompt(subject: string, style: string = 'professional'): string {
    const styleMap: Record<string, string> = {
      professional: 'professional, clean, modern, corporate design, high quality',
      creative: 'creative, artistic, vibrant, abstract, unique',
      minimal: 'minimalist, clean lines, simple, elegant, white space',
      technical: 'technical, precise, data visualization, charts, futuristic'
    };

    return `${subject}, ${styleMap[style] || styleMap.professional}, 8K, detailed`;
  }

  getHistory(userId: string): CreativeResult[] {
    return this.generationHistory.get(userId) || [];
  }

  private parseCreativeRequest(request: FamilyOrchestrationRequest): CreativeRequest {
    const input = request.userInput.toLowerCase();
    let type: CreativeRequest['type'] = 'general';
    let tone: CreativeRequest['tone'] = 'professional';

    if (/营销|推广|广告/.test(input)) type = 'marketing';
    else if (/报告|分析/.test(input)) type = 'report';
    else if (/社交|分享|朋友圈/.test(input)) type = 'social';
    else if (/演示|PPT|展示/.test(input)) type = 'presentation';
    else if (/品牌|Logo|配色/.test(input)) type = 'branding';

    if (/轻松|活泼|有趣/.test(input)) tone = 'casual';
    else if (/创意|灵感|想象/.test(input)) tone = 'creative';
    else if (/技术|专业|深入/.test(input)) tone = 'technical';
    else if (/激励|鼓舞|正能量/.test(input)) tone = 'inspiring';

    return {
      prompt: request.userInput,
      type,
      tone,
      targetAudience: request.context?.targetAudience,
      language: request.context?.language || 'zh-CN',
      variations: request.context?.variations || 3
    };
  }

  private async generateAssets(req: CreativeRequest): Promise<CreativeAsset[]> {
    const assets: CreativeAsset[] = [];

    switch (req.type) {
      case 'marketing':
        assets.push(...this.generateMarketingAssets(req));
        break;
      case 'branding':
        assets.push(...this.generateBrandingAssets(req));
        break;
      case 'social':
        assets.push(...this.generateSocialAssets(req));
        break;
      default:
        assets.push(...this.generateGeneralAssets(req));
    }

    assets.push(this.generateColorAsset());
    assets.push(this.generateLayoutAsset());

    return assets;
  }

  private generateMarketingAssets(req: CreativeRequest): CreativeAsset[] {
    const templates = this.getMarketingCopy('strategy_launch');
    return templates.map((t, i) => ({
      id: `creative_mkt_${i}_${Date.now()}`,
      type: 'copywriting' as const,
      content: JSON.stringify(t),
      style: req.tone,
      format: 'json',
      metadata: { headline: t.headline, body: t.body, cta: t.cta }
    }));
  }

  private generateBrandingAssets(_req: CreativeRequest): CreativeAsset[] {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    return [{
      id: `creative_brand_${Date.now()}`,
      type: 'color_palette',
      content: JSON.stringify(palette),
      style: 'branding',
      format: 'json',
      metadata: palette
    }];
  }

  private generateSocialAssets(req: CreativeRequest): CreativeAsset[] {
    const prompts = [
      `量化交易数据分析可视化图表，${req.tone}风格`,
      `金融科技产品界面设计，现代化简约`,
      `AI智能投资助手概念图，未来科技感`
    ];

    return prompts.map((p, i) => ({
      id: `creative_social_${i}_${Date.now()}`,
      type: 'image_prompt' as const,
      content: this.generateImagePrompt(p, req.tone === 'creative' ? 'creative' : 'professional'),
      style: req.tone,
      format: 'text'
    }));
  }

  private generateGeneralAssets(req: CreativeRequest): CreativeAsset[] {
    const count = req.variations || 3;
    const assets: CreativeAsset[] = [];

    for (let i = 0; i < count; i++) {
      assets.push({
        id: `creative_gen_${i}_${Date.now()}`,
        type: 'text',
        content: this.generateTextVariation(req.prompt, i, req.tone),
        style: req.tone,
        format: 'markdown'
      });
    }

    return assets;
  }

  private generateTextVariation(prompt: string, index: number, tone: string): string {
    const toneMap: Record<string, string[]> = {
      professional: ['根据分析表明', '数据显示', '研究表明'],
      casual: ['你知道吗', '跟大家分享', '轻松聊聊'],
      creative: ['想象一下', '灵感迸发', '创意无限'],
      technical: ['从技术角度看', '基于算法分析', '数据模型显示'],
      inspiring: ['突破自我', '追求卓越', '无限可能']
    };

    const prefixes = toneMap[tone] || toneMap.professional;
    const prefix = prefixes[index % prefixes.length];

    return `## 创意方案 ${index + 1}\n\n${prefix}，关于"${prompt}"的内容创作：\n\n这是一个基于${tone}风格的创意内容，可根据实际需求进一步定制和优化。`;
  }

  private generateColorAsset(): CreativeAsset {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    return {
      id: `creative_palette_${Date.now()}`,
      type: 'color_palette',
      content: JSON.stringify(palette),
      style: 'recommended',
      format: 'json',
      metadata: palette
    };
  }

  private generateLayoutAsset(): CreativeAsset {
    const layout = LAYOUT_TEMPLATES[0];
    return {
      id: `creative_layout_${Date.now()}`,
      type: 'layout',
      content: JSON.stringify(layout),
      style: 'recommended',
      format: 'json',
      metadata: layout
    };
  }

  private recordGeneration(userId: string, result: CreativeResult): void {
    if (!this.generationHistory.has(userId)) this.generationHistory.set(userId, []);
    const history = this.generationHistory.get(userId)!;
    history.push(result);
    if (history.length > 20) this.generationHistory.set(userId, history.slice(-10));
  }
}

let graceInstance: GraceCreativeService | null = null;

export function getGraceCreativeService(): GraceCreativeService {
  if (!graceInstance) {
    graceInstance = new GraceCreativeService();
  }
  return graceInstance;
}
