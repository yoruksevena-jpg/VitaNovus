const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImage = document.getElementById('previewImage');
const generateBtn = document.getElementById('generateBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const resultStatus = document.getElementById('resultStatus');
const aiFeedbackText = document.getElementById('aiFeedbackText');
const scriptInput = document.getElementById('scriptInput');
const poseSelect = document.getElementById('poseSelect');

// File Simulation
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = 'var(--border-light)'; });
uploadArea.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });
uploadArea.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', (e) => { handleFile(e.target.files[0]); });

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            checkGenerateReadiness();
        };
        reader.readAsDataURL(file);
    }
}

scriptInput.addEventListener('input', checkGenerateReadiness);

function checkGenerateReadiness() {
    if (previewImage.src && scriptInput.value.length > 5) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
    }
}

generateBtn.addEventListener('click', async () => {
    if (generateBtn.disabled) return;

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Analiz Yapılıyor...';
    progressContainer.style.display = 'block';
    resultStatus.style.display = 'none';

    // Reset progress
    progressBar.style.width = '0%';
    progressText.innerText = 'Görsel Yükleniyor...';
    progressPercent.innerText = '0%';

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            progressBar.style.width = `${progress}%`;
            progressPercent.innerText = `${Math.floor(progress)}%`;

            if (progress > 20 && progress < 50) progressText.innerText = 'Görsel İnceleniyor...';
            if (progress > 50 && progress < 80) progressText.innerText = 'Tasarım Kriterleri Değerlendiriliyor...';
            if (progress > 80) progressText.innerText = 'Rapor Oluşturuluyor...';
        }
    }, 200);

    try {
        const base64Image = previewImage.src.split(',')[1];
        const prompt = `
        Görseldeki reklam tasarımını bir profesyonel grafik tasarımcı ve pazarlama uzmanı gözüyle incele.
        
        Hedef Kitle ve Mesaj: ${scriptInput.value}
        Tasarım Tarzı: ${poseSelect.value}

        Lütfen şu başlıklar altında Türkçe olarak, eleştirel ve somut geliştirme önerileri içeren bir geri bildirim ver:
        1. 🎨 Görsel Tasarım ve Kompozisyon
        2. ✍️ Renk kullanımı ve Tipografi
        3. 🎯 Hedef Kitleye Uygunluk
        4. ✅ İyileştirme Önerileri (Maddeler halinde)
        
        Sadece analiz sonucunu yaz, giriş/kapanış cümlelerine gerek yok.
        `;

        const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();

        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        progressPercent.innerText = '100%';
        progressText.innerText = 'Tamamlandı!';

        if (data.candidates && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            showResult(aiResponse);
        } else {
            showResult("Üzgünüm, analiz yapılamadı. Lütfen tekrar deneyin.");
        }

    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error:', error);
        showResult("Bir hata oluştu: " + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Yeniden Yorumla';
    }
});

function showResult(text) {
    resultStatus.style.display = 'block';
    aiFeedbackText.innerText = text;
    // Scroll to result
    resultStatus.scrollIntoView({ behavior: 'smooth' });
}
