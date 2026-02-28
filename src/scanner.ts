import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Scans a directory for jewelry image files (jpg/jpeg/png/webp).
 * Returns a sorted list of absolute file paths.
 * Throws if the directory does not exist.
 */
export async function scanJewelryImages(dir: string): Promise<string[]> {
    if (!fs.existsSync(dir)) {
        throw new Error(`Jewelry directory does not exist: ${dir}`);
    }

    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        throw new Error(`Path is not a directory: ${dir}`);
    }

    const entries = fs.readdirSync(dir);
    const imagePaths: string[] = [];

    for (const entry of entries) {
        const ext = path.extname(entry).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
            imagePaths.push(path.join(dir, entry));
        }
    }

    if (imagePaths.length === 0) {
        throw new Error(`No image files found in: ${dir}`);
    }

    return imagePaths.sort();
}
