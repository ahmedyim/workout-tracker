import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

try {
    const r = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Say hello',
    })
    console.log('OK:', r.text)
} catch (e) {
    console.error('ERROR:', e.message)
}