import path from "node:path";
import { fileURLToPath } from "node:url";

export type JewelryType = "necklace" | "earring" | "ring";

const JEWELRY_BASE_DIR = "G:\\阿里云盘\\电商\\产品_待生成";
const OUTPUT_BASE_DIR = "G:\\阿里云盘\\电商\\产品_已生成";
const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const DEFAULT_CONCURRENCY = 5;

export const PROJECT_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

export interface Config {
    apiKey: string;
    modelImagePath: string;
    jewelryDir: string;
    outputDir: string;
    jewelryType: JewelryType;
    concurrency: number;
    geminiModel: string;
}

const VALID_JEWELRY_TYPES: JewelryType[] = ["necklace", "earring", "ring"];

function parseArgs(argv: string[]): Record<string, string> {
    const args: Record<string, string> = {};

    // Named flags: --flag value
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith("--")) {
            const key = argv[i].slice(2);
            const value = argv[i + 1];
            if (value && !value.startsWith("--")) {
                args[key] = value;
                i++;
            }
        }
    }

    // Positional fallback — npm on Windows strips --flag names when using `npm start --`
    // order: date, model, type, concurrency (optional)
    const positional = argv.filter((a) => !a.startsWith("--"));
    if (!args["date"] && positional[0]) args["date"] = positional[0];
    if (!args["model"] && positional[1]) args["model"] = positional[1];
    if (!args["type"] && positional[2]) args["type"] = positional[2];
    if (!args["concurrency"] && positional[3]) args["concurrency"] = positional[3];

    return args;
}


export function buildConfig(argv: string[]): Config {
    const args = parseArgs(argv);

    const missing: string[] = [];
    if (!args["date"]) missing.push("--date");
    if (!args["model"]) missing.push("--model");
    if (!args["type"]) missing.push("--type");

    if (missing.length > 0) {
        console.error(`❌ Missing required arguments: ${missing.join(", ")}`);
        console.error("");
        console.error("Usage:");
        console.error(
            '  npx tsx src/main.ts --date 20260228 --model "G:\\...\\002.jpeg" --type necklace [--concurrency 5] [--model-name gemini-3.1-flash-image-preview]'
        );
        process.exit(1);
    }

    const jewelryType = args["type"] as JewelryType;
    if (!VALID_JEWELRY_TYPES.includes(jewelryType)) {
        console.error(
            `❌ Invalid --type "${jewelryType}". Must be one of: ${VALID_JEWELRY_TYPES.join(", ")}`
        );
        process.exit(1);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is not set. Please create a .env file.");
        process.exit(1);
    }

    const date = args["date"];
    const concurrency = args["concurrency"]
        ? parseInt(args["concurrency"], 10)
        : DEFAULT_CONCURRENCY;

    return {
        apiKey,
        modelImagePath: args["model"],
        jewelryDir: `${JEWELRY_BASE_DIR}\\${date}\\${jewelryType}`,
        outputDir: `${OUTPUT_BASE_DIR}\\${date}`,
        jewelryType,
        concurrency: isNaN(concurrency) ? DEFAULT_CONCURRENCY : concurrency,
        geminiModel: args["model-name"] ?? DEFAULT_MODEL,
    };
}
