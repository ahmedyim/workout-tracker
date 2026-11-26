import { GoogleGenAI } from '@google/genai'
// Server-only: the key is read from the environment, never sent to the browser
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
// Models to try in order. Use names your key can actually use.
const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite']
// Only busy-server and rate-limit errors are worth retrying
function isRetryable(err: unknown) {
    const status = (err as { status?: number })?.status
    return status === 503 || status === 429
}

export async function generateJson(prompt: string, system: string): Promise<unknown> {
    let lastError: unknown

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        systemInstruction: system,
                        responseMimeType: 'application/json',
                    },
                })

                const text = (response.text ?? '').replace(/```json|```/g, '').trim()
                return JSON.parse(text)
            } catch (err) {
                lastError = err
                console.error(`Model ${model} attempt ${attempt} failed:`, (err as Error).message)
                if (!isRetryable(err)) break
                await new Promise((r) => setTimeout(r, 1500 * attempt))
            }
        }
    }

    throw lastError
}

// Keeps the plan generator working without changes
export const generatePlanJson = generateJson