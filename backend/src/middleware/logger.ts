import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, 'logs');

// ensure logs folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// get log file name (daily)
const getLogFile = () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logDir, `${date}.log`);
};

// write log
const writeLog = (level: string, message: string, meta: any = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  fs.appendFileSync(getLogFile(), JSON.stringify(logEntry) + '\n');
};

// main logger
const logger = {
  info: (msg: string, meta?: any) => writeLog('INFO', msg, meta),
  error: (msg: string, meta?: any) => writeLog('ERROR', msg, meta),
  warn: (msg: string, meta?: any) => writeLog('WARN', msg, meta),
  debug: (msg: string, meta?: any) => writeLog('DEBUG', msg, meta),
};

export default logger;