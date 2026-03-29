declare module 'nunjucks' {
  interface ConfigureOptions {
    autoescape?: boolean;
    throwOnUndefined?: boolean;
    trimBlocks?: boolean;
    lstripBlocks?: boolean;
    tags?: Record<string, string>;
  }

  interface Environment {
    render(name: string, context?: Record<string, unknown>): string;
    addFilter(name: string, fn: (...args: unknown[]) => unknown): void;
  }

  export function configure(path: string | string[], options?: ConfigureOptions): Environment;
}
