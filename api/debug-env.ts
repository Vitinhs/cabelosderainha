import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const envKeys = Object.keys(process.env);
    const filteredKeys = envKeys.filter(key =>
        key.includes('API_KEY') ||
        key.includes('GEMINI') ||
        key.includes('OPENAI') ||
        key.includes('GOOGLE') ||
        key.includes('VITE_') ||
        key === 'NODE_ENV' ||
        key === 'VERCEL_ENV'
    );

    const debugInfo = {
        foundRelevantKeys: filteredKeys,
        keyDetails: filteredKeys.reduce((acc, key) => {
            const val = process.env[key];
            acc[key] = val ? `Present (length: ${val.length})` : 'Missing/Empty';
            return acc;
        }, {} as Record<string, string>),
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        cwd: process.cwd(),
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(debugInfo);
}
