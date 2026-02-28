# Task: ImageGenerator Project

## Phase 1: Project Setup ✅
- [x] `docs/PRD.md` — created, updated with confirmed specs + official doc ref
- [x] `prompts/necklace.txt` — "Authentic Daily Moments" prompt (film photography, Kodak Portra 400 style)
- [x] `prompts/earring.txt` — earring prompt placeholder
- [x] `prompts/README.md` — prompt folder usage docs
- [x] `package.json` — `npm init -y`, `type:module`, `start` script
- [x] `tsconfig.json` — ESNext/bundler for tsx ESM compatibility
- [x] Install deps: `@google/genai`, `dotenv`, `p-limit`
- [x] Install devDeps: `typescript`, `tsx`, `@types/node`
- [x] `.env.example` — `GEMINI_API_KEY=your_key_here`
- [x] `.gitignore` — ignore `.env`, `node_modules/`

## Phase 2: Source Modules ✅

### `src/config.ts`
- [x] `JewelryType` union: `'necklace' | 'earring' | 'ring'`
- [x] `Config` interface + `buildConfig(argv)` with CLI arg parsing
- [x] Supports both `--flag value` and positional args (Windows npm workaround)
- [x] `jewelryDir` = `产品_待生成\{date}\{type}`
- [x] `outputDir` = `产品_已生成\{date}\{type}`
- [x] Default concurrency: `2`

### `src/scanner.ts`
- [x] `scanJewelryImages(dir)` — reads flat dir, filters `.jpg`/`.jpeg`/`.png`/`.webp`
- [x] Returns sorted absolute paths, throws if dir missing or empty

### `src/promptLoader.ts`
- [x] `loadPrompt(jewelryType)` — reads `prompts/{type}.txt`
- [x] Throws clear error if file missing or empty

### `src/geminiClient.ts`
- [x] `GeminiClient` class with `editImage(model, jewelry, prompt)`
- [x] Sends raw Buffer as `inlineData` (no compression)
- [x] Auto MIME type detection from extension
- [x] Retry: max 2× with exponential backoff (1s → 2s)

### `src/pipeline.ts`
- [x] `runPipeline()` with `p-limit` concurrency control
- [x] On **success**: save `{basename}_result.jpg` + **move** source to output dir
- [x] On **failure**: log to `failedList`, leave source untouched
- [x] Real-time progress: `[3/120] ✓ 001.jpg` / `[4/120] ✗ 002.jpg`

### `src/main.ts`
- [x] CLI args: `--date`, `--model`, `--type` (required), `--concurrency`, `--model-name` (optional)
- [x] Creates `outputDir` recursively
- [x] Writes `failed.json` on any failures
- [x] Writes `run.log` with timestamp + summary

## Phase 3: Verification ✅
- [x] `npm install` — 0 vulnerabilities
- [x] TypeScript — zero errors (`tsc --noEmit`)
- [x] Single image end-to-end test — `[1/1] ✓ 001.png` in 40.3s
- [x] Output saved to `产品_已生成\{date}\{type}\`
- [x] `run.log` written correctly
- [ ] Verify source file **moved** (not deleted) to output dir on success
- [ ] Verify `failed.json` generated on deliberate failure
- [ ] Batch test with multiple images

## Post-MVP Changes Log
| Date | Change |
|------|--------|
| 2026-03-01 | CLI arg parsing fixed for Windows npm positional fallback |
| 2026-03-01 | Output dir changed to include `{type}` subdirectory |
| 2026-03-01 | Source file now **moved** to output dir (was: deleted) |
| 2026-03-01 | `necklace.txt` rewritten — Authentic Daily Moments theme, film photography style |
| 2026-03-01 | Default concurrency changed to `2` |
