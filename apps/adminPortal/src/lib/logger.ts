type LogLevel = 'error' | 'info' | 'warn';

interface LogEntry {
  context: string;
  data?: unknown;
  level: LogLevel;
  message: string;
  timestamp: string;
}

function log(level: LogLevel, context: string, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    context,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== undefined ? { data } : {}),
  };

  if (!import.meta.env.DEV) {
    return;
  }

  const output = `[${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(output, data ?? '');
    return;
  }

  if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(output, data ?? '');
    return;
  }

  // eslint-disable-next-line no-console
  console.log(output, data ?? '');
}

export const logger = {
  error: (context: string, message: string, data?: unknown) => log('error', context, message, data),
  info: (context: string, message: string, data?: unknown) => log('info', context, message, data),
  warn: (context: string, message: string, data?: unknown) => log('warn', context, message, data),
};
