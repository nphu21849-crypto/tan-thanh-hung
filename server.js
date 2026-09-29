const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};

// Read local secrets without adding a runtime dependency. Real environment variables take precedence.
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
} catch {}

const allowlist = new Map([
  ['thanglehuy789@gmail.com', process.env.ADMIN_PASSWORD_THANGLEHUY789 || ''],
  ['nphu21849@gmail.com', process.env.ADMIN_PASSWORD_NPHU21849 || '']
]);
const passwordRecords = new Map();
for (const [email, password] of allowlist) {
  if (password.length >= 16 && !/replace-with|change-me|your-password/i.test(password)) passwordRecords.set(email, { salt: crypto.randomBytes(16), hash: crypto.scryptSync(password, Buffer.from(email), 64) });
}
const sessions = new Map();
const loginAttempts = new Map();
const SESSION_MS = 8 * 60 * 60 * 1000;
const COOKIE_NAME = 'tth_admin_session';
const isProduction = process.env.NODE_ENV === 'production';

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
function sendJson(res, status, value, headers = {}) {
  setSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(value));
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim().split(/=(.*)/s).slice(0, 2)).filter(pair => pair.length === 2));
}
function currentAdmin(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  const record = token && sessions.get(token);
  if (!record) return '';
  if (record.expires <= Date.now()) { sessions.delete(token); return ''; }
  return record.email;
}
function clearSession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (token) sessions.delete(token);
  const secure = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}
function isSameOrigin(req) {
  if (!req.headers.origin) return true;
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
function readJson(req, maxBytes = 8192) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) { reject(new Error('too_large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('bad_json')); }
    });
    req.on('error', reject);
  });
}
function allowLogin(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, since: now };
  if (now - record.since > 15 * 60 * 1000) { record.count = 0; record.since = now; }
  if (record.count >= 8) return false;
  record.count += 1;
  loginAttempts.set(ip, record);
  return true;
}
function serveFile(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relative.split(/[\\/]/).some(part => part.startsWith('.'))) {
    res.writeHead(404, { 'Cache-Control': 'no-store' }).end('Not found');
    return;
  }
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(file, (error, content) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    setSecurityHeaders(res);
    res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    if (pathname.toLowerCase() === '/admin.html') {
      res.setHeader('Cache-Control', 'no-store');
      content = Buffer.from(content.toString('utf8').replace('</head>', `<script>window.TTHServerAdmin=${JSON.stringify({ email: currentAdmin(req) })}</script></head>`));
    }
    res.writeHead(200);
    res.end(content);
  });
}

http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }

  if (pathname === '/api/admin/login' && req.method === 'POST') {
    if (!isSameOrigin(req)) return sendJson(res, 403, { message: 'Yêu cầu không hợp lệ.' });
    const ip = req.socket.remoteAddress || 'unknown';
    if (!allowLogin(ip)) return sendJson(res, 429, { message: 'Bạn đã thử quá nhiều lần. Hãy chờ 15 phút rồi thử lại.' });
    let payload;
    try { payload = await readJson(req); } catch (error) { return sendJson(res, error.message === 'too_large' ? 413 : 400, { message: 'Thông tin đăng nhập không hợp lệ.' }); }
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '').slice(0, 200);
    const record = passwordRecords.get(email);
    if (!record) return sendJson(res, passwordRecords.size ? 401 : 503, { message: passwordRecords.size ? 'Email hoặc mật khẩu không đúng.' : 'Máy chủ chưa được cấu hình mật khẩu quản trị. Hãy thiết lập file .env.' });
    const candidate = crypto.scryptSync(password, Buffer.from(email), 64);
    if (!crypto.timingSafeEqual(candidate, record.hash)) return sendJson(res, 401, { message: 'Email hoặc mật khẩu không đúng.' });
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { email, expires: Date.now() + SESSION_MS });
    const secure = isProduction ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_MS / 1000)}${secure}`);
    return sendJson(res, 200, { authenticated: true });
  }
  if (pathname === '/api/admin/session' && req.method === 'GET') {
    const email = currentAdmin(req);
    return email ? sendJson(res, 200, { authenticated: true, email }) : sendJson(res, 401, { authenticated: false });
  }
  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    if (!isSameOrigin(req)) return sendJson(res, 403, { message: 'Yêu cầu không hợp lệ.' });
    clearSession(req, res);
    return sendJson(res, 200, { authenticated: false });
  }
  if (pathname.toLowerCase() === '/admin.html' && req.method === 'GET' && !currentAdmin(req)) {
    setSecurityHeaders(res);
    res.writeHead(303, { Location: '/account.html?notice=admin', 'Cache-Control': 'no-store' }).end();
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
  serveFile(req, res, pathname);
}).listen(port, process.env.HOST || '127.0.0.1', () => {
  const missing = [...allowlist].filter(([email]) => !passwordRecords.has(email)).map(([email]) => email);
  console.log(`Tân Thành Hưng website: http://localhost:${port}`);
  if (missing.length) console.warn(`Admin login disabled until .env passwords (at least 16 characters) are set for: ${missing.join(', ')}`);
});
