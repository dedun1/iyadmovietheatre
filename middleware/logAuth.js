const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "..", "auth_logs.txt");

function logAuthEvent(type, username, ip) {
    const line = `${new Date().toISOString()} | ${type} | user: ${username} | ip: ${ip}\n`;
    fs.appendFile(logPath, line, () => {});
}

module.exports = logAuthEvent;
