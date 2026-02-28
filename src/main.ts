import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { buildConfig } from "./config.js";
import { scanJewelryImages } from "./scanner.js";
import { loadPrompt } from "./promptLoader.js";
import { runPipeline } from "./pipeline.js";

async function main() {
    const startTime = new Date();
    const config = buildConfig(process.argv.slice(2));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  🏷️  AI Jewelry Product Image Generator");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Type        : ${config.jewelryType}`);
    console.log(`  Model image : ${config.modelImagePath}`);
    console.log(`  Jewelry dir : ${config.jewelryDir}`);
    console.log(`  Output dir  : ${config.outputDir}`);
    console.log(`  Concurrency : ${config.concurrency}`);
    console.log(`  AI Model    : ${config.geminiModel}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Load prompt
    const prompt = await loadPrompt(config.jewelryType);
    console.log(`📝 Loaded prompt: prompts/${config.jewelryType}.txt\n`);

    // Scan jewelry images
    let jewelryFiles: string[];
    try {
        jewelryFiles = await scanJewelryImages(config.jewelryDir);
    } catch (err) {
        console.error(`❌ ${err instanceof Error ? err.message : err}`);
        process.exit(1);
    }
    console.log(`📦 Found ${jewelryFiles.length} image(s) to process\n`);

    // Create output dir
    fs.mkdirSync(config.outputDir, { recursive: true });

    // Run pipeline
    const result = await runPipeline(config, jewelryFiles, prompt);

    const endTime = new Date();
    const durationSec = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(1);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ✅ Succeeded : ${result.succeeded}`);
    console.log(`  ❌ Failed    : ${result.failed.length}`);
    console.log(`  ⏱  Duration  : ${durationSec}s`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Write failed.json if any failures
    if (result.failed.length > 0) {
        const failedPath = path.join(config.outputDir, "failed.json");
        fs.writeFileSync(failedPath, JSON.stringify(result.failed, null, 2), "utf-8");
        console.log(`📋 Failed list written to: ${failedPath}`);
    }

    // Write run.log
    const logPath = path.join(config.outputDir, "run.log");
    const logContent = [
        `Run at       : ${startTime.toISOString()}`,
        `Duration     : ${durationSec}s`,
        `Type         : ${config.jewelryType}`,
        `Model image  : ${config.modelImagePath}`,
        `Jewelry dir  : ${config.jewelryDir}`,
        `Output dir   : ${config.outputDir}`,
        `Concurrency  : ${config.concurrency}`,
        `AI Model     : ${config.geminiModel}`,
        `Total        : ${jewelryFiles.length}`,
        `Succeeded    : ${result.succeeded}`,
        `Failed       : ${result.failed.length}`,
        "",
        ...(result.failed.length > 0
            ? ["Failed files:", ...result.failed.map((f) => `  - ${f.file}: ${f.error}`)]
            : ["All files processed successfully."]),
    ].join("\n");

    fs.writeFileSync(logPath, logContent, "utf-8");
    console.log(`📋 Run log written to: ${logPath}\n`);

    // Exit with error code if any failures
    process.exit(result.failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
