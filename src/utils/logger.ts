// src/logger.ts
import * as fs from 'fs';
import * as path from 'path';

export function writeLog(message: string): void {
  const logDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const logFile = path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`);
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage, "utf-8");
  console.log("Logged:", message);
}
