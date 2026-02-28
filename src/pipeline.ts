import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { type Config } from "./config.js";
import { GeminiClient } from "./geminiClient.js";

export interface FailedItem {
    file: string;
    error: string;
}

export interface PipelineResult {
    succeeded: number;
    failed: FailedItem[];
}

/**
 * Runs the full image generation pipeline.
 * - Uses p-limit to cap concurrent API requests.
 * - On success: saves result image, moves source file to output dir.
 * - On failure: logs to failedList, does NOT move source.
 * - Prints real-time progress to stdout.
 */
export async function runPipeline(
    config: Config,
    jewelryFiles: string[],
    prompt: string
): Promise<PipelineResult> {
    const client = new GeminiClient(config.apiKey, config.geminiModel);
    const limit = pLimit(config.concurrency);
    const total = jewelryFiles.length;
    let done = 0;
    const failedList: FailedItem[] = [];

    // Ensure output directory exists
    fs.mkdirSync(config.outputDir, { recursive: true });

    const tasks = jewelryFiles.map((jewelryPath) =>
        limit(async () => {
            const basename = path.basename(jewelryPath, path.extname(jewelryPath));
            const outputFilename = `${basename}_result.jpg`;
            const outputPath = path.join(config.outputDir, outputFilename);

            try {
                const imageBuffer = await client.editImage(
                    config.modelImagePath,
                    jewelryPath,
                    prompt
                );

                fs.writeFileSync(outputPath, imageBuffer);

                // Move source file to output dir on success
                const movedSourcePath = path.join(config.outputDir, path.basename(jewelryPath));
                fs.renameSync(jewelryPath, movedSourcePath);

                done++;
                console.log(`[${done}/${total}] ✓ ${path.basename(jewelryPath)}`);
            } catch (err) {
                done++;
                const errorMsg = err instanceof Error ? err.message : String(err);
                failedList.push({ file: jewelryPath, error: errorMsg });
                console.error(
                    `[${done}/${total}] ✗ ${path.basename(jewelryPath)} — ${errorMsg}`
                );
            }
        })
    );

    await Promise.all(tasks);

    return {
        succeeded: total - failedList.length,
        failed: failedList,
    };
}
