# ONE ARCANA

*Ask. Shuffle. Pick one.*

A quiet, minimal, multilingual one-card tarot experience.

**Live:** [onearcana.xergnik.com](https://onearcana.xergnik.com/)

[中文](#中文) · [日本語](#日本語) · [English](#english)

---

## 中文

ONE ARCANA 是一个极简的 Web 单牌塔罗工具。

网站只负责：**提问 → 洗牌 → 选牌 → 翻牌 → 复制给 AI**。它不会生成长篇预测，也不连接 AI API；更深入的解读由用户自己的 AI Assistant 完成。

### 功能

- 通过鼠标或手指亲手洗牌，支持 Pointer Events 与轻量震动反馈
- 从完整 78 张 Rider–Waite–Smith 塔罗牌中自行选择一张
- 使用 `crypto.getRandomValues()` 产生牌面及正逆位结果
- 中文、日文、英文三语界面与基础牌义
- 一键生成适合保存、分享或发送给 AI 的结果图片
- 支持复制结构化提示词给 AI Assistant
- 响应式设计，适配桌面端与移动端
- 纯前端，无账号、后端、数据库或 AI API

### 本地运行

```bash
npm install
npm run dev
```

同一 Wi-Fi 下使用手机测试：

```bash
npm run dev:lan
```

在手机浏览器中打开 Vite 输出的 Network 地址即可。

---

## 日本語

ONE ARCANA は、静かでミニマルなワンカード・タロット Web ツールです。

サイトが提供するのは、**問い → シャッフル → 選択 → カードを開く → AI 用にコピー**という体験です。長い未来予測や AI API による自動鑑定は行わず、より深い解釈はユーザー自身の AI Assistant に委ねます。

### 機能

- Pointer Events によるマウス・タッチ共通のシャッフル操作と軽い振動フィードバック
- 78 枚の Rider–Waite–Smith タロットから、自分で一枚を選ぶ体験
- `crypto.getRandomValues()` によるカードと正逆位置の抽選
- 中国語・日本語・英語の UI と基本的なカード解説
- 保存、共有、AI への送信に適した結果画像の生成
- AI Assistant 用の構造化プロンプトをワンタップでコピー
- デスクトップとモバイルに対応したレスポンシブデザイン
- アカウント、バックエンド、データベース、AI API を使用しない純粋なフロントエンド構成

### ローカルで実行

```bash
npm install
npm run dev
```

同じ Wi-Fi 上のスマートフォンで確認する場合：

```bash
npm run dev:lan
```

Vite が表示する Network URL をスマートフォンのブラウザで開いてください。

---

## English

ONE ARCANA is a quiet, minimal one-card tarot tool for the web.

The site handles only: **Ask → Shuffle → Choose → Reveal → Copy for AI**. It does not produce long-form predictions or call an AI API; deeper interpretation is left to the user’s own AI Assistant.

### Features

- Mouse and touch shuffling through Pointer Events, with subtle vibration feedback where supported
- A tactile choice from the complete 78-card Rider–Waite–Smith deck
- Card and orientation selection powered by `crypto.getRandomValues()`
- Chinese, Japanese, and English interfaces with concise traditional meanings
- Share-card generation for saving, sharing, or sending to an AI Assistant
- One-tap copying of a structured AI interpretation prompt
- Responsive desktop and mobile layouts
- Fully client-side: no account, backend, database, or AI API

### Run locally

```bash
npm install
npm run dev
```

To test on a phone connected to the same Wi-Fi:

```bash
npm run dev:lan
```

Open the Network URL printed by Vite in the phone’s browser.

---

## Technology / 技术栈 / 技術構成

- Vue 3
- JavaScript
- Vite
- Canvas API
- Pointer Events
- Web Crypto API

## Build / 构建 / ビルド

```bash
npm run build
```

## Card artwork / 牌图 / カード画像

The 78 Rider–Waite–Smith card scans in `public/assets/tarot/cards` are public-domain “Pam-A” scans sourced from [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). See the artwork directory README for details.

`public/assets/tarot/cards` 中的 78 张 Rider–Waite–Smith 牌图来自 Wikimedia Commons 的公共领域 “Pam-A” 扫描版本。详细来源与版权说明请查看牌图目录中的 README。

`public/assets/tarot/cards` に収録されている 78 枚の Rider–Waite–Smith カード画像は、Wikimedia Commons のパブリックドメイン “Pam-A” スキャンです。出典と権利情報の詳細はカード画像ディレクトリの README を参照してください。

## Links

- Website: [onearcana.xergnik.com](https://onearcana.xergnik.com/)
- Creator: [© 2026 XER_GNIK](https://xergnik.com/)
