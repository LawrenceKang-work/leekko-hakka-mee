// TableSites 发布编排器(平台无关)。
// 读 D1 客户配置 + 改动 → 按配置的多个 target 分流烧录到本地 repo 工作副本。
// 不做 git commit —— 写完文件交给 CI(GitHub Action)或调用方 push,各平台自动部署。
// 用法: node run.mjs <client_id> <repo_root>
//   依赖 wrangler 能连 D1(CLOUDFLARE_API_TOKEN);在 feedback-api 目录上下文调用。
import path from 'path';
import { execSync } from 'child_process';
import { bakeFile } from './engine.mjs';

const [, , clientId, repoRoot] = process.argv;
if (!clientId || !repoRoot) { console.error('用法: node run.mjs <client_id> <repo_root>'); process.exit(1); }
const FB_DIR = process.env.FB_DIR || 'C:/Programming/Webside/tablesites-feedback-api';
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID;
const CF_DB_ID = process.env.CF_D1_ID || '6de9876b-69ed-4eb9-ae06-badfd7d684d9';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// 读 D1:CI 环境(有 account+token)用 REST API(不依赖 wrangler.toml);本地用 wrangler
async function d1(sql) {
  if (CF_ACCOUNT && CF_TOKEN) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/d1/database/${CF_DB_ID}/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql }),
    });
    const j = await r.json();
    if (!j.success) throw new Error('D1 API: ' + JSON.stringify(j.errors));
    return j.result[0].results;
  }
  const raw = execSync(
    `npx wrangler d1 execute tablesites-feedback --remote --json --command "${sql.replace(/"/g, '\\"')}"`,
    { cwd: FB_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 1024 * 1024 * 20 }
  );
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('D1 输出无法解析');
  return JSON.parse(m[0])[0].results;
}

// 1. 客户配置
const cfgRow = (await d1(`SELECT bake_config FROM clients WHERE client_id='${clientId}'`))[0];
if (!cfgRow || !cfgRow.bake_config) throw new Error(`客户 ${clientId} 没有 bake_config 配置`);
const cfg = JSON.parse(cfgRow.bake_config);
console.log(`▶ 发布 ${clientId} → ${cfg.repo} (${cfg.platform || 'git'});目标 ${cfg.targets.length} 个`);

// 2. 改动:每 (el_key, lang) 取最新一条
const rows = await d1(`SELECT el_key,el_type,new_text,new_image_url,lang,created_at FROM feedback WHERE client_id='${clientId}' AND status='edit' ORDER BY created_at ASC`);
const latest = {};
for (const r of rows) { if (r.el_key) latest[r.el_key + '|' + (r.lang || 'zh')] = r; }

// 3. 分流:翻译表 key(非 t:/img:)→ 文案 target(i18n-js/json);t:/img: → html target
const htmlKey = k => k.startsWith('t:') || k.startsWith('img:');
const buckets = new Map(cfg.targets.map(t => [t.file, []]));
let dropped = 0;
for (const k in latest) {
  const r = latest[k];
  if (r.el_type === 'image' && (!r.new_image_url || r.new_image_url.startsWith('('))) { dropped++; continue; } // 占位上传图跳过
  const target = cfg.targets.find(t => htmlKey(r.el_key) ? t.format === 'html' : t.format !== 'html');
  if (!target) { dropped++; continue; }
  buckets.get(target.file).push({ key: r.el_key, lang: r.lang || 'zh', value: r.el_type === 'image' ? r.new_image_url : r.new_text, type: r.el_type });
}

// 4. 逐 target 烧录
let total = 0;
for (const t of cfg.targets) {
  const edits = buckets.get(t.file);
  if (!edits.length) continue;
  const abs = path.join(repoRoot, t.file);
  const res = await bakeFile(t.format, abs, edits);
  total += res.applied;
  console.log(`  [${t.format}] ${t.file}: 烧录 ${res.applied}/${edits.length}` + (res.skipped.length ? `,跳过 ${res.skipped.length}` : ''));
}
console.log(`✓ 共烧录 ${total} 处` + (dropped ? `;丢弃 ${dropped}(占位图/无目标)` : '') + ' —— 待 git commit & 部署');
