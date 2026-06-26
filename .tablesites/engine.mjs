// TableSites 通用烧录引擎(模块版,平台无关)。
// bakeFile(format, file, edits) → { applied, skipped };新增格式只加一个适配器。
import fs from 'fs';

export async function bakeFile(format, file, edits) {
  const A = { 'i18n-js': bakeI18nJs, 'json': bakeJson, 'html': bakeHtml };
  const fn = A[format];
  if (!fn) throw new Error(`未知格式 "${format}";支持: ${Object.keys(A).join(', ')}`);
  return await fn(file, edits);
}

// leekko 式 i18n.js:提取 var T={...}(后跟 function applyLang 做锚点,可重复跑)→ 改 → JSON 写回
function bakeI18nJs(file, edits) {
  let src = fs.readFileSync(file, 'utf8');
  const RE = /var\s+T\s*=\s*(\{[\s\S]*?\})\s*;(?=\s*function applyLang)/;
  const m = src.match(RE);
  if (!m) throw new Error('找不到翻译表 T');
  const T = (0, eval)('(' + m[1] + ')');
  const r = applyToTable(T, edits);
  src = src.replace(RE, 'var T = ' + JSON.stringify(T, null, 2) + ';');
  fs.writeFileSync(file, src);
  return r;
}

// 标准 content.json:结构化改写(新项目/Vercel/React 用,最干净)
function bakeJson(file, edits) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const r = applyToTable(data, edits);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return r;
}

function applyToTable(table, edits) {
  let applied = 0; const skipped = [];
  for (const e of edits) {
    if (!(e.key in table)) { skipped.push(e.key); continue; }
    if (e.lang && table[e.key] && typeof table[e.key] === 'object') {
      if (!(e.lang in table[e.key])) { skipped.push(e.key + '@' + e.lang); continue; }
      table[e.key][e.lang] = e.value;
    } else table[e.key] = e.value;
    applied++;
  }
  return { applied, skipped };
}

// 静态 HTML:cheerio 按 data-fb-key/data-i18n 改 innerHTML、按 img: 原 src 换图
async function bakeHtml(file, edits) {
  const { load } = await import('cheerio');
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  let applied = 0; const skipped = [];
  for (const e of edits) {
    let el = $(`[data-fb-key="${cssEsc(e.key)}"],[data-i18n="${cssEsc(e.key)}"]`).first();
    if (!el.length && e.key.startsWith('img:')) el = $(`img[src="${cssEsc(e.key.slice(4))}"]`).first();
    if (!el.length) { skipped.push(e.key); continue; }
    if (e.type === 'image') el.attr('src', e.value);
    else el.html(e.value);
    applied++;
  }
  fs.writeFileSync(file, $.html());
  return { applied, skipped };
}
function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }
