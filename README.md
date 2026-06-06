# 烈哥客家面 · Leekko Hakka Mee

怡保（Ipoh）客家手作面老字号 **烈哥客家面 Leekko Hakka Mee** 的品牌官网——
一个单页长滚动、移动优先、以简体中文为主的传统餐厅营销站点。

> 自 1974 年 · 三代传承 · 一根正艾木棍，压出半世纪不变的古早味。

## 技术栈

零构建的**纯静态站点**：原生 HTML / CSS / JavaScript，无框架、无打包、无依赖安装。
直接用任意静态服务器即可托管（GitHub Pages / Netlify / Vercel / nginx 皆可）。

- 字体经 CSS `@import` 加载自 Google Fonts（Noto Serif SC / Noto Sans SC / DM Serif Display / DM Sans）——**运行时需联网**。
- 纸纹叠加为内联 SVG data-URI，无外链。

## 目录结构

```
.
├── index.html          # 站点入口（hero / 品牌故事 / 制面工艺 / 菜单 / 寻味门店 / 影像 / 页脚）
├── leekko/
│   ├── leekko.css      # 设计系统：奶油底 + 招牌墨绿 + 医章红 + 金线 + 衬线中文
│   └── leekko.js       # sticky nav · hero 视差 · 移动抽屉 · 滚动淡入 · 画廊 lightbox
└── uploads/            # 站点引用的 22 张图片
```

## 本地预览

任选其一（均无需安装依赖）：

```bash
# Node
npm start                 # = npx --yes serve .

# 或 Python
python -m http.server 8080
```

然后浏览器打开 `http://localhost:8080`（或 serve 提示的端口）。

## 设计来源

由 Claude Design（claude.ai/design）产出的 HTML/CSS/JS 原型移交包，按原型 **像素级忠实**
还原。配色锚定自门店实拍招牌：深墨绿遮阳棚、医章红圆牌、金色细线、奶油色刻字。

## 部署到 GitHub Pages（可选）

仓库 Settings → Pages → Source 选 `main` 分支根目录即可。站点为纯静态，无需构建步骤。

---

© 2026 烈哥客家面 Leekko Hakka Mee · 三代手作 · 古早味相传
