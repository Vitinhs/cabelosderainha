

async function test() {
    const url = 'https://cabelosderainha.vercel.app/api/diagnostic';
    const data = {
        hairType: "Cacheado",
        problems: ["Ressecamento", "Frizz"],
        goals: ["Hidratação", "Brilho"],
        currentRoutine: "Lavo 2x por semana com shampoo comum."
    };

    console.log('Testando rota:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Resultado:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

test();
