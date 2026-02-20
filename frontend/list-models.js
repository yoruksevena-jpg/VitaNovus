const https = require('https');

const API_KEY = 'AIzaSyDsjRfFisJE6l9IFeMtgLJ_1qwexIMnhq4';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log('Listing models...');

https.get(API_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const response = JSON.parse(data);
        if (response.models) {
            console.log('Available Models:');
            response.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${model.name}`);
                }
            });
        } else {
            console.log('Error listing models:', response);
        }
    });

}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
