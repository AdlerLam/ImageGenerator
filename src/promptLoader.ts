import fs from "node:fs";
import path from "node:path";
import { type JewelryType, PROJECT_ROOT } from "./config.js";

/**
 * Loads the prompt template for the given jewelry type.
 * Reads from prompts/{jewelryType}.txt relative to project root.
 */
export async function loadPrompt(jewelryType: JewelryType): Promise<string> {
    const promptPath = path.join(PROJECT_ROOT, "prompts", `${jewelryType}.txt`);

    if (!fs.existsSync(promptPath)) {
        throw new Error(
            `Prompt file not found for type "${jewelryType}": ${promptPath}`
        );
    }

    const content = fs.readFileSync(promptPath, "utf-8").trim();

    if (!content) {
        throw new Error(`Prompt file is empty: ${promptPath}`);
    }

    return content;
}
