# 🏷️ ImageGenerator

AI 首饰产品图生成工具 — 读取模特图与首饰原图，调用 Gemini Image Editing API 自动合成电商产品图。

---

## ✨ 功能

- 📁 读取阿里云盘挂载路径下的首饰图（按日期/类型目录归档）
- 🤖 调用 Google Gemini API 将首饰合成到模特图上
- ⚡ 支持并发批量处理（默认 2 并发，可配置）
- ✅ 成功：生成 `{原文件名}_result.jpg`，原图移动至输出目录
- ❌ 失败：跳过并记录到 `failed.json`，原图保留不动
- 📋 每次运行生成 `run.log` 记录详情

---

## 📂 目录结构

```
ImageGenerator/
├── docs/
│   ├── PRD.md          # 产品需求文档
│   └── TASK.md         # 任务清单
├── prompts/
│   ├── necklace.txt    # 项链 prompt 模板
│   ├── earring.txt     # 耳环 prompt 模板
│   └── README.md       # Prompt 编写说明
├── src/
│   ├── config.ts       # CLI 参数解析 + Config 结构
│   ├── scanner.ts      # 扫描首饰图目录
│   ├── promptLoader.ts # 读取 prompt 文件
│   ├── geminiClient.ts # Gemini API 封装（含重试）
│   ├── pipeline.ts     # 并发处理流程
│   └── main.ts         # CLI 入口
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗂️ 云盘路径约定

| 用途 | 路径 |
|------|------|
| 模特图 | `G:\阿里云盘\电商\模特图\female\002.jpeg` |
| 首饰原图 | `G:\阿里云盘\电商\产品_待生成\{date}\{type}\*.jpg` |
| 生成产品图 | `G:\阿里云盘\电商\产品_已生成\{date}\{type}\*_result.jpg` |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

```bash
cp .env.example .env
```

编辑 `.env`：
```
GEMINI_API_KEY=你的_Gemini_API_Key
```

### 3. 运行

```bash
npm start -- --date 20260228 --model "G:\阿里云盘\电商\模特图\female\002.jpeg" --type necklace
```

**全部参数：**

| 参数 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `--date` | ✅ | 首饰图日期文件夹，如 `20260228` | — |
| `--model` | ✅ | 模特图完整路径 | — |
| `--type` | ✅ | 首饰类型：`necklace` / `earring` / `ring` | — |
| `--concurrency` | ❌ | 并发请求数 | `2` |
| `--model-name` | ❌ | Gemini 模型 | `gemini-3.1-flash-image-preview` |

---

## 📊 运行输出示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏷️  AI Jewelry Product Image Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Type        : necklace
  Concurrency : 2
  AI Model    : gemini-3.1-flash-image-preview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Found 5 image(s) to process

[1/5] ✓ 001.jpg
[2/5] ✓ 002.jpg
[3/5] ✗ 003.jpg — API Error: ...
[4/5] ✓ 004.jpg
[5/5] ✓ 005.jpg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Succeeded : 4
  ❌ Failed    : 1
  ⏱  Duration  : 85.2s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 Prompt 模板

每种首饰类型对应 `prompts/{type}.txt`，可直接编辑调整风格。

当前 `necklace.txt` 风格：**Authentic Daily Moments** — 胶片摄影（Kodak Portra 400）、小红书/IG 生活感、自然光。

---

## 🔗 参考资料

- [Gemini API Image Generation 官方文档（JavaScript）](https://ai.google.dev/gemini-api/docs/image-generation#javascript_1)
- [@google/genai SDK](https://www.npmjs.com/package/@google/genai)
