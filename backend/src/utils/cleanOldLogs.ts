import fs from 'fs';
export const cleanOldLogs = () => {
  const files = fs.readdirSync(logDir);

  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  files.forEach(file => {
    const filePath = path.join(logDir, file);

    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log: ${file}`);
    }
  });
};