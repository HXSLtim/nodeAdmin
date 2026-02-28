import React from 'react';

interface ModuleErrorBoundaryProps {
  children: React.ReactNode;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
}

export class ModuleErrorBoundary extends React.Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(): ModuleErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error): void {
    console.error('[ModuleErrorBoundary]', error);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
    });
  };

  override render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
        <h2 className="text-base font-semibold">模块渲染失败</h2>
        <p className="mt-1 text-sm">该模块发生运行时错误，请稍后重试或刷新页面。</p>
        <button
          className="mt-3 rounded-md border border-red-300 px-3 py-1 text-sm"
          onClick={this.handleReset}
          type="button"
        >
          重试
        </button>
      </section>
    );
  }
}
