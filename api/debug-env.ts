import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const envKeys = Object.keys(process.env).filter(key =>
        key.includes('API_KEY') ||
        key.includes('GEMINI') ||
        key.includes('OPENAI') ||
        key.includes('GOOGLE') ||
        key.includes('VITE_')
    );

    const debugInfo = {
        availableKeys: envKeys,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(debugInfo);
}
