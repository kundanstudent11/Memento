import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && { meta }),
  };

  const output = env.NODE_ENV === 'production' ? JSON.stringify(entry) : formatDev(entry);

  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

function formatDev(entry: { timestamp: string; level: LogLevel; message: string; meta?: unknown }): string {
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[90m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
  };
  const reset = '\x1b[0m';
  const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
  return `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.message}${metaStr}`;
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
