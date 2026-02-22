const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Otomatik API Key Rotasyonu
// .env'e birden fazla key eklenebilir:
// GEMINI_API_KEY=key1,key2,key3
// ===================================
const allKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;
const keyFailCounts = {};

function getNextKey() {
    // Tüm keyler tükendiyse sıfırla
    const allExhausted = allKeys.every(k => keyFailCounts[k] >= 3);
    if (allExhausted) {
        allKeys.forEach(k => keyFailCounts[k] = 0);
        console.log('🔄 Tüm keyler sıfırlandı, baştan başlıyor...');
    }

    // Geçerli bir key bul
    for (let i = 0; i < allKeys.length; i++) {
        const idx = (currentKeyIndex + i) % allKeys.length;
        const key = allKeys[idx];
        if ((keyFailCounts[key] || 0) < 3) {
            currentKeyIndex = idx;
            return key;
        }
    }
    return allKeys[0]; // fallback
}

console.log(`✅ ${allKeys.length} API key yüklendi. Otomatik rotasyon aktif.`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../')));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Health Check & Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Routes
app.post('/api/generate-content', async (req, res) => {
    const { contents, generationConfig } = req.body;

    if (!allKeys.length) {
        return res.status(500).json({ error: 'API Key bulunamadı.' });
    }

    const model = 'gemini-flash-latest';
    const MAX_RETRIES = allKeys.length; // Her key için bir deneme

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const apiKey = getNextKey();
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const body = { contents };
            if (generationConfig) body.generationConfig = generationConfig;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.status === 429) {
                // Bu key limitine ulaştı, bir sonrakine geç
                keyFailCounts[apiKey] = (keyFailCounts[apiKey] || 0) + 1;
                currentKeyIndex = (currentKeyIndex + 1) % allKeys.length;
                console.log(`⚠️ Key ${attempt + 1} limitinde, diğerine geçiliyor... (${attempt + 1}/${MAX_RETRIES})`);
                continue; // Sonraki key ile dene
            }

            if (!response.ok) {
                console.error('Gemini API Error:', data);
                return res.status(response.status).json(data);
            }

            // Başarılı - bu key'in fail sayısını sıfırla
            keyFailCounts[apiKey] = 0;
            return res.json(data);

        } catch (error) {
            console.error('Fetch Error:', error.message);
        }
    }

    // Tüm keyler limitinde
    console.error('❌ Tüm API keyleri limitinde!');
    res.status(429).json({
        error: 'Günlük AI limiti doldu. Lütfen birkaç dakika bekleyin veya yarın tekrar deneyin.',
        candidates: [{
            content: {
                parts: [{ text: '⚠️ Günlük AI kullanım limiti doldu. Lütfen birkaç dakika bekleyin.' }]
            }
        }]
    });
});
