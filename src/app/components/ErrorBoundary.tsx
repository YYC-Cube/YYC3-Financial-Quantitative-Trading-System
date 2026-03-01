import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#071425] text-[#CCD6F6] p-4">
          <div className="bg-[#112240] p-6 rounded-lg border border-[#233554] max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">组件渲染错误</h2>
            <p className="text-sm text-[#8892B0] mb-4">
              系统检测到局部组件异常，为了保护您的数据安全，已自动隔离该区域。
            </p>
            <div className="bg-[#0A192F] p-2 rounded text-xs text-left overflow-auto max-h-32 mb-4 font-mono">
              {this.state.error?.message || 'Unknown Error'}
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-[#38B2AC] text-white rounded hover:brightness-110 transition-all text-sm font-bold"
            >
              尝试恢复
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}