import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from '@/app/components/SafeIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0A192F] p-4">
          <div className="max-w-md w-full bg-[#112240] border border-[#233554] rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-[#F56565]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              系统渲染异常
            </h2>
            <p className="text-[#8892B0] mb-4">
              检测到组件渲染错误，可能由于浏览器扩展或缓存导致
            </p>
            <div className="bg-[#0A192F] border border-[#233554] rounded p-3 mb-4 text-left">
              <p className="text-xs text-[#8892B0] font-mono break-all">
                {this.state.error?.message || '未知错误'}
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full bg-[#38B2AC] hover:bg-[#38B2AC]/90 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              重新加载页面
            </button>
            <p className="text-xs text-[#8892B0] mt-4">
              如问题持续，请尝试：<br />
              1. 清除浏览器缓存<br />
              2. 禁用浏览器扩展<br />
              3. 使用无痕模式
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}