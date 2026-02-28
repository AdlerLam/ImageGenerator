# Task: ImageGenerator Project

## Phase 1: Project Setup
- [x] `docs/PRD.md` — created and updated with all confirmed specs
- [x] `prompts/necklace.txt` — precise English necklace prompt
- [x] `prompts/earring.txt` — earring prompt placeholder
- [x] `prompts/README.md` — prompt folder usage docs
- [ ] `package.json` — `npm init -y`
- [ ] `tsconfig.json` — target ES2022, module NodeNext
- [ ] Install deps: `@google/genai`, `dotenv`, `p-limit`
- [ ] Install devDeps: `typescript`, `tsx`, `@types/node`
- [ ] `.env.example` — `GEMINI_API_KEY=your_key_here`
- [ ] `.env` — actual key (gitignored)
- [ ] `.gitignore` — ignore `.env`, `node_modules/`

## Phase 2: Source Modules

### `src/config.ts`
- [ ] Define `JewelryType` union type: `'necklace' | 'earring' | 'ring'`
- [ ] Export `Config` interface and `buildConfig(args)` function
- [ ] Fields: `modelImagePath`, `jewelryDir`, `outputDir`, `jewelryType`, `concurrency`, `model`, `apiKey`
- [ ] `jewelryDir` = `{base}\{date}\{type}\` (from CLI args)
- [ ] `outputDir` = `G:\阿里云盘\电商\产品_已生成\{date}\`

### `src/scanner.ts`
- [ ] `scanJewelryImages(dir: string): Promise<string[]>`
- [ ] Read dir, filter `.jpg` / `.jpeg` (case-insensitive)
- [ ] Return sorted list of absolute file paths
- [ ] Throw clear error if dir doesn't exist

### `src/promptLoader.ts`
- [ ] `loadPrompt(jewelryType: JewelryType): Promise<string>`
- [ ] Read `prompts/{jewelryType}.txt` relative to project root
- [ ] Throw clear error if file not found

### `src/geminiClient.ts`
- [ ] `GeminiClient` class, initialized with `apiKey` + `model`
- [ ] `editImage(modelImagePath, jewelryImagePath, prompt): Promise<Buffer>`
- [ ] Read both images as raw Buffer (no compression)
- [ ] Detect MIME type from extension (`.jpg`→`image/jpeg`, `.png`→`image/png`)
- [ ] Send as `inlineData` parts to Gemini image editing API
- [ ] Parse response parts, return first `inline_data` image Buffer
- [ ] Retry on failure: max 2 retries with exponential backoff (1s, 2s)

### `src/pipeline.ts`
- [ ] `runPipeline(config, jewelryFiles, prompt): Promise<PipelineResult>`
- [ ] Use `p-limit` with `config.concurrency` (default 5)
- [ ] For each jewelry file:
  - [ ] On **success**: save `{outputDir}/{basename}_result.jpg`, then **delete** source file from `产品_待生成`
  - [ ] On **failure** (after retries): push to `failedList` with filename + error message, do NOT delete source
- [ ] Print real-time progress: `[3/120] ✓ 001.jpg` / `[4/120] ✗ 002.jpg (reason)`
- [ ] Return `{ succeeded, failed: FailedItem[] }`

### `src/main.ts`
- [ ] Parse CLI args:
  - `--date 20260228` (required)
  - `--model "G:\...\002.jpeg"` (required)
  - `--type necklace` (required, must match `JewelryType`)
  - `--concurrency 5` (optional, default 5)
  - `--model-name gemini-3.1-flash-image-preview` (optional)
- [ ] Validate all required args, print usage and exit on error
- [ ] Create `outputDir` if not exists (`fs.mkdirSync` recursive)
- [ ] Load prompt → scan images → run pipeline
- [ ] Write `{outputDir}/failed.json` if any failures
- [ ] Write `{outputDir}/run.log` with timestamp, args, succeeded/failed counts
- [ ] Exit code `0` on full success, `1` if any failures

## Phase 3: Verification
- [ ] Run `npm install` successfully
- [ ] Single image end-to-end test (1 necklace + 1 model)
- [ ] Verify output saved to `G:\阿里云盘\电商\产品_已生成\{date}\`
- [ ] Verify source file deleted from `产品_待生成` on success
- [ ] Verify `failed.json` generated correctly on deliberate failure
- [ ] Verify `run.log` contains run summary
- [ ] Batch test with concurrency (simulate 5+ images)
