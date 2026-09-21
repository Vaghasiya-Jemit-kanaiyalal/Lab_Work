import fs from 'fs';
import path from 'path';

export const requestLogger = (req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  console.log(logMessage.trim());
  try {
    fs.appendFileSync(path.join(process.cwd(), 'requests.log.txt'), logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
  next();
};
