import type {TypedKeys} from 'mod-util/typed-keys';

type Method = TypedKeys<Console, LogMethod>;

function log(m: Method, args: any[]): void {
  (console[m] as LogMethod)('[ActionWorkflows]', ...args);
}

type LogMethod = (segment1: any, ...furtherSegments: any[]) => void;

export const debugLog: LogMethod = (...segments) => {
  if (process.env.PRODUCTION) {
    return;
  }

  log('log', segments);
};

export const warnLog: LogMethod = (...segments) => {
  log('warn', segments);
};

export const errorLog: LogMethod = (...segments) => {
  log('error', segments);
};
