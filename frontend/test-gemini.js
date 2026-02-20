const https = require('https');

const API_KEY = 'AIzaSyDsjRfFisJE6l9IFeMtgLJ_1qwexIMnhq4';
const MODEL = 'gemini-1.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello, are you working?" }]
    }]
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Testing URL: https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=HIDDEN`);

const req = https.request(API_URL, options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(responseBody);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
