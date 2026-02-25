const BASE_URL = 'https://cabelosderainha-six.vercel.app';

const html = await fetch(BASE_URL).then(r => r.text());
const scriptMatch = html.match(/src="(\/assets\/index[^"]+\.js)"/);

if (!scriptMatch) {
    console.log('❌ Script JS não encontrado no HTML');
    process.exit(1);
}

const scriptUrl = BASE_URL + scriptMatch[1];
console.log('📦 Script URL:', scriptUrl);

const js = await fetch(scriptUrl).then(r => r.text());
const hasKey = js.includes('AIzaSy');
const hasGeminiUrl = js.includes('generativelanguage.googleapis.com');

console.log('🔑 Chave Gemini embutida no bundle:', hasKey ? '✅ SIM' : '❌ NÃO');
console.log('🌐 URL da API Gemini no bundle:', hasGeminiUrl ? '✅ SIM' : '❌ NÃO');

if (!hasKey) {
    console.log('\n⚠️  PROBLEMA: VITE_GEMINI_API_KEY não foi injetada no build de produção.');
    console.log('   Adicione a variável no painel do Vercel e faça Redeploy.');
} else {
    console.log('\n✅ Tudo certo! O bundle tem a chave e a chamada ao Gemini configuradas.');
    console.log('   Testando chamada real à API...');

    // extrai a chave do bundle para testar
    const keyMatch = js.match(/AIzaSy[a-zA-Z0-9_-]{33}/);
    if (keyMatch) {
        const testKey = keyMatch[0];
        const testRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${testKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Diga apenas: OK' }] }] })
            }
        );
        const testData = await testRes.json();
        const reply = testData.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('🤖 Resposta do Gemini:', reply?.trim() || JSON.stringify(testData));
    }
}
