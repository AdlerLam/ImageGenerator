import { GoogleGenAI, type Part } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const MIME_MAP: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
};

function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_MAP[ext] ?? "image/jpeg";
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GeminiClient {
    private ai: GoogleGenAI;
    private model: string;

    constructor(apiKey: string, model: string) {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = model;
    }

    /**
     * Edits the model image by compositing the jewelry onto it using the given prompt.
     * Reads both images as raw Buffers (no compression) and sends as inlineData.
     * Retries up to 2 times on failure with exponential backoff.
     */
    async editImage(
        modelImagePath: string,
        jewelryImagePath: string,
        prompt: string
    ): Promise<Buffer> {
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this._callApi(modelImagePath, jewelryImagePath, prompt);
            } catch (err) {
                if (attempt < maxRetries) {
                    const waitMs = 1000 * Math.pow(2, attempt); // 1s, 2s
                    await sleep(waitMs);
                } else {
                    throw err;
                }
            }
        }

        // This should never be reached, but TypeScript requires it
        throw new Error("Unexpected end of retry loop");
    }

    private async _callApi(
        modelImagePath: string,
        jewelryImagePath: string,
        prompt: string
    ): Promise<Buffer> {
        const modelImageData = fs.readFileSync(modelImagePath);
        const jewelryImageData = fs.readFileSync(jewelryImagePath);

        const modelMime = getMimeType(modelImagePath);
        const jewelryMime = getMimeType(jewelryImagePath);

        const contents: Part[] = [
            {
                inlineData: {
                    data: modelImageData.toString("base64"),
                    mimeType: modelMime,
                },
            },
            {
                inlineData: {
                    data: jewelryImageData.toString("base64"),
                    mimeType: jewelryMime,
                },
            },
            {
                text: prompt,
            },
        ];

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: [{ role: "user", parts: contents }],
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
            if (part.inlineData?.data) {
                return Buffer.from(part.inlineData.data, "base64");
            }
        }

        throw new Error(
            "Gemini API returned no image. Response: " +
            JSON.stringify(response.candidates?.[0]?.content)
        );
    }
}
