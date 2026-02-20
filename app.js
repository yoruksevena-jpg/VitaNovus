// ===================================
// CV Builder Application - JavaScript
// ===================================

// API Configuration
// API Configuration
const GEMINI_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api/generate-content'
  : '/api/generate-content';

// Global State
let cvData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: []
};

let currentTemplate = 'modern';

// Keyword Database (simulated AI)
const keywordDatabase = {
  'yazılım': ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'Agile', 'SQL', 'Docker', 'AWS', 'System Design'],
  'geliştirici': ['JavaScript', 'HTML/CSS', 'Git', 'Problem Çözme', 'Algoritmalar', 'Veri Yapıları', 'CI/CD', 'Testing'],
  'mimar': ['AutoCAD', 'Revit', '3ds Max', 'SketchUp', 'Bina Yönetmelikleri', 'Proje Yönetimi', 'Sürdürülebilir Tasarım', 'Adobe Photoshop', 'Lumion', 'Teknik Çizim'],
  'iç mimar': ['Mekan Tasarımı', 'AutoCAD', 'SketchUp', 'Renk Teorisi', 'Malzeme Bilgisi', 'Ergonomi', 'Aydınlatma Tasarımı', '3D Render', 'Müşteri İlişkileri', 'Bütçe Planlama'],
  'grafik': ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Tipografi', 'Renk Teorisi', 'Marka Kimliği', 'UI/UX', 'Figma', 'Baskı Hazırlık', 'Yaratıcı Düşünme'],
  'pazarlama': ['SEO', 'Google Analytics', 'Sosyal Medya', 'İçerik Stratejisi', 'CRM', 'Pazar Araştırması', 'Marka Yönetimi', 'Email Marketing', 'Copywriting', 'Reklam Kampanyaları'],
  'satış': ['Müşteri İlişkileri (CRM)', 'İkna Kabiliyeti', 'Müzakere', 'Satış Stratejisi', 'B2B/B2C', 'Pazar Analizi', 'Sunum Becerileri', 'Soğuk Arama', 'Networking', 'Kapanış Teknikleri'],
  'öğretmen': ['Sınıf Yönetimi', 'Müfredat Geliştirme', 'Eğitim Teknolojileri', 'Öğrenci Değerlendirme', 'İletişim', 'Pedagoji', 'Liderlik', 'Özel Eğitim', 'Mentörlük', 'Zaman Yönetimi'],
  'muhasebe': ['Excel (İleri)', 'Finansal Raporlama', 'Vergi Mevzuatı', 'Bütçeleme', 'SAP', 'Denetim', 'Nakite Akışı', 'Maliyet Analizi', 'Defter Tutma', 'Luca/Logo'],
  'insan kaynakları': ['İşe Alım', 'Mülakat Teknikleri', 'Performans Yönetimi', 'Çalışan Bağlılığı', 'İş Kanunu', 'Bordro', 'Eğitim Planlama', 'Organizasyonel Gelişim', 'Çatışma Çözümü', 'İK Metrikleri'],
  'yönetici': ['Liderlik', 'Stratejik Planlama', 'Ekip Yönetimi', 'Bütçe Yönetimi', 'Karar Verme', 'Performans Değerlendirme', 'Risk Yönetimi', 'Delegasyon', 'Değişim Yönetimi', 'İletişim'],
  'mühendis': ['Proje Yönetimi', 'AutoCAD', 'Teknik Analiz', 'Problem Çözme', 'Matlab', 'Kalite Kontrol', 'Süreç İyileştirme', 'Raporlama', 'Takım Çalışması', 'İş Sağlığı ve Güvenliği'],
  'default': ['İletişim', 'Takım Çalışması', 'Problem Çözme', 'Zaman Yönetimi', 'Liderlik', 'Analitik Düşünme', 'Proje Yönetimi', 'Uyumluluk', 'Yaratıcılık', 'Kritik Düşünme']
};

// ===================================
// Initialization
// ===================================
// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Common initialization
  // Wait for Auth to be ready
  document.addEventListener('auth-ready', () => {
    loadSavedCVs();
  });

  // Fallback for pages without auth or timeouts
  setTimeout(() => {
    if (!window.savedCVsLoaded) loadSavedCVs();
  }, 2000);

  // Page-specific initialization
  const path = window.location.pathname;
  const page = path.split('/').pop();

  // Check authentication status
  if (typeof checkAuth === 'function') {
    checkAuth();
  }

  if (page === 'editor.html') {
    initEditor();
  } else if (page === 'dashboard.html' || page === 'cv-history.html') {
    renderCVList();
  } else {
    // Landing page (index.html or root)
    if (page === '' || page === 'index.html') {
      // Landing page specific logic if any
    }
  }

  // Add scroll effect to header (common)
  window.addEventListener('scroll', handleScroll);
});

function initEditor() {
  // Check if we are redirected for editing
  const editId = localStorage.getItem('editCVId');
  if (editId) {
    // We need to wait for savedCVs to load from storage first
    setTimeout(() => {
      loadCV(editId);
      localStorage.removeItem('editCVId'); // Clear after loading
    }, 100);
  } else {
    loadFromLocalStorage();
  }

  updatePreview();
  calculateScore();
}

// ===================================
// Header Scroll Effect
// ===================================
function handleScroll() {
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// ===================================
// Template Management
// ===================================
function selectTemplate(templateName) {
  currentTemplate = templateName;
  document.getElementById('templateSelect').value = templateName;
  changeTemplate();

  // Scroll to editor
  document.getElementById('editor').scrollIntoView({ behavior: 'smooth' });
}

function changeTemplate() {
  const select = document.getElementById('templateSelect');
  currentTemplate = select.value;

  const preview = document.getElementById('cvPreview');

  // Remove all template classes
  preview.classList.remove('template-modern', 'template-professional', 'template-creative', 'template-minimalist', 'template-executive', 'template-tech');

  // Add the current template class
  preview.classList.add(`template-${currentTemplate}`);

  // Apply template-specific styles (inline overrides)
  // Reset border first
  preview.style.borderLeft = '';
  preview.style.borderTop = '';

  switch (currentTemplate) {
    case 'modern':
      preview.style.borderLeft = '4px solid #667eea';
      break;
    case 'professional':
      preview.style.borderLeft = '4px solid #3b82f6';
      break;
    case 'creative':
      preview.style.borderLeft = '4px solid #ec4899';
      break;
    case 'minimalist':
      // Style handled by CSS
      break;
    case 'executive':
      // Style handled by CSS
      break;
    case 'tech':
      // Style handled by CSS
      break;
  }

  updatePreview();
}

// ===================================
// Real-time Preview Update
// ===================================
function updatePreview() {
  // Update personal information
  const fullName = document.getElementById('fullName').value || 'Adınız Soyadınız';
  const jobTitle = document.getElementById('jobTitle').value || 'Meslek Unvanınız';
  const email = document.getElementById('email').value || 'email@example.com';
  const phone = document.getElementById('phone').value || '+90 555 123 4567';
  const location = document.getElementById('location').value || 'Konum';
  const linkedin = document.getElementById('linkedin').value;

  document.getElementById('previewName').textContent = fullName;
  document.getElementById('previewTitle').textContent = jobTitle;
  document.getElementById('previewEmail').textContent = email;
  document.getElementById('previewPhone').textContent = phone;
  document.getElementById('previewLocation').textContent = location;

  if (linkedin) {
    document.getElementById('previewLinkedin').textContent = linkedin;
    document.getElementById('previewLinkedin').style.display = 'inline';
  } else {
    document.getElementById('previewLinkedin').style.display = 'none';
  }

  // Update summary
  const summary = document.getElementById('summary').value;
  const summarySection = document.getElementById('summarySection');
  if (summary) {
    document.getElementById('previewSummary').textContent = summary;
    summarySection.style.display = 'block';
  } else {
    summarySection.style.display = 'none';
  }

  // Update experience
  updateExperiencePreview();

  // Update education
  updateEducationPreview();

  // Update skills
  updateSkillsPreview();

  // Run AI keyword analysis
  analyzeKeywords();

  // Save to localStorage
  saveToLocalStorage();

  // Recalculate score
  calculateScore();

  // Check section completion
  checkSectionCompletion('section-personal', [fullName, jobTitle, email, phone]);
  checkSectionCompletion('section-summary', [summary]);

  const expItems = document.querySelectorAll('.experience-item');
  const eduItems = document.querySelectorAll('.education-item');
  const skillsVal = document.getElementById('skills').value;

  checkSectionListCompletion('section-experience', expItems);
  checkSectionListCompletion('section-education', eduItems);
  checkSectionCompletion('section-skills', [skillsVal]);
}

function checkSectionCompletion(sectionId, values) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const isComplete = values.every(v => v && v.trim().length > 0);
  if (isComplete) section.classList.add('completed');
  else section.classList.remove('completed');
}

function checkSectionListCompletion(sectionId, nodeList) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  let isComplete = false;
  if (nodeList.length > 0) {
    // Check if at least one item has content (simple check)
    const firstItem = nodeList[0];
    const inputs = firstItem.querySelectorAll('input, textarea');
    let hasContent = false;
    inputs.forEach(input => {
      if (input.value.trim().length > 0) hasContent = true;
    });
    isComplete = hasContent;
    if (isComplete) section.classList.add('completed');
    else section.classList.remove('completed');
  }
}

// ===================================
// Experience Management
// ===================================
function updateExperiencePreview() {
  const experienceItems = document.querySelectorAll('.experience-item');
  const previewContainer = document.getElementById('previewExperience');
  const experienceSection = document.getElementById('experienceSection');

  previewContainer.innerHTML = '';
  let hasExperience = false;

  experienceItems.forEach((item) => {
    const position = item.querySelector('.exp-position').value;
    const company = item.querySelector('.exp-company').value;
    const date = item.querySelector('.exp-date').value;
    const description = item.querySelector('.exp-description').value;

    if (position || company) {
      hasExperience = true;
      const expHTML = `
        <div class="cv-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${position || 'Pozisyon'}</div>
              <div class="cv-item-subtitle">${company || 'Şirket'}</div>
            </div>
            <div class="cv-item-date">${date || 'Tarih'}</div>
          </div>
          ${description ? `<div class="cv-item-description">${description.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      `;
      previewContainer.innerHTML += expHTML;
    }
  });

  experienceSection.style.display = hasExperience ? 'block' : 'none';
}

function addExperience() {
  const container = document.getElementById('experienceContainer');
  const index = container.children.length;

  const newItem = document.createElement('div');
  newItem.className = 'experience-item';
  newItem.setAttribute('data-index', index);
  newItem.innerHTML = `
    <div class="form-group">
      <label class="form-label">Pozisyon</label>
      <input type="text" class="form-input exp-position" placeholder="Yazılım Geliştirici" oninput="updatePreview()">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Şirket</label>
        <input type="text" class="form-input exp-company" placeholder="Tech Company" oninput="updatePreview()">
      </div>
      <div class="form-group">
        <label class="form-label">Tarih</label>
        <input type="text" class="form-input exp-date" placeholder="Ocak 2020 - Şimdi" oninput="updatePreview()">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Açıklama</label>
      <textarea class="form-textarea exp-description" placeholder="• Başarılarınızı yazın&#10;• Ölçülebilir sonuçlar ekleyin" oninput="updatePreview()"></textarea>
      <button class="btn btn-secondary btn-sm mt-1" onclick="generateBulletPointsWithAI(${index})" type="button">✨ AI ile Oluştur</button>
    </div>
    <button class="btn btn-outline btn-sm mt-1" onclick="removeExperience(${index})">Kaldır</button>
    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
  `;

  container.appendChild(newItem);
}

function removeExperience(index) {
  const item = document.querySelector(`.experience-item[data-index="${index}"]`);
  if (item) {
    item.remove();
    updatePreview();
  }
}

// ===================================
// Education Management
// ===================================
function updateEducationPreview() {
  const educationItems = document.querySelectorAll('.education-item');
  const previewContainer = document.getElementById('previewEducation');
  const educationSection = document.getElementById('educationSection');

  previewContainer.innerHTML = '';
  let hasEducation = false;

  educationItems.forEach((item) => {
    const degree = item.querySelector('.edu-degree').value;
    const school = item.querySelector('.edu-school').value;
    const date = item.querySelector('.edu-date').value;

    if (degree || school) {
      hasEducation = true;
      const eduHTML = `
        <div class="cv-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${degree || 'Derece'}</div>
              <div class="cv-item-subtitle">${school || 'Okul'}</div>
            </div>
            <div class="cv-item-date">${date || 'Tarih'}</div>
          </div>
        </div>
      `;
      previewContainer.innerHTML += eduHTML;
    }
  });

  educationSection.style.display = hasEducation ? 'block' : 'none';
}

function addEducation() {
  const container = document.getElementById('educationContainer');
  const index = container.children.length;

  const newItem = document.createElement('div');
  newItem.className = 'education-item';
  newItem.setAttribute('data-index', index);
  newItem.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Derece</label>
        <input type="text" class="form-input edu-degree" placeholder="Lisans Derecesi" oninput="updatePreview()">
      </div>
      <div class="form-group">
        <label class="form-label">Tarih</label>
        <input type="text" class="form-input edu-date" placeholder="2015 - 2019" oninput="updatePreview()">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Okul</label>
      <input type="text" class="form-input edu-school" placeholder="Üniversite Adı" oninput="updatePreview()">
    </div>
    <button class="btn btn-outline btn-sm mt-1" onclick="removeEducation(${index})">Kaldır</button>
    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
  `;

  container.appendChild(newItem);
}

function removeEducation(index) {
  const item = document.querySelector(`.education-item[data-index="${index}"]`);
  if (item) {
    item.remove();
    updatePreview();
  }
}

// ===================================
// Skills Management
// ===================================
function updateSkillsPreview() {
  const skillsInput = document.getElementById('skills').value;
  const previewContainer = document.getElementById('previewSkills');
  const skillsSection = document.getElementById('skillsSection');

  if (skillsInput.trim()) {
    const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
    previewContainer.innerHTML = skills.map(skill =>
      `<span class="cv-skill-tag">${skill}</span>`
    ).join('');
    skillsSection.style.display = 'block';
  } else {
    skillsSection.style.display = 'none';
  }
}

// ===================================
// AI Keyword Analysis (Simulated)
// ===================================
function analyzeKeywords() {
  const jobTitle = document.getElementById('jobTitle').value.toLowerCase();
  const suggestionsContainer = document.getElementById('keywordSuggestions');

  if (!jobTitle) {
    suggestionsContainer.innerHTML = '';
    return;
  }

  // Find matching keywords (longest match first)
  let keywords = keywordDatabase['default'];
  let isDefault = true;

  const keys = Object.keys(keywordDatabase).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    if (key !== 'default' && jobTitle.includes(key)) {
      keywords = keywordDatabase[key];
      isDefault = false;
      break;
    }
  }

  // Get current skills
  const currentSkills = document.getElementById('skills').value.toLowerCase().split(',').map(s => s.trim());

  // Find missing keywords
  const missingKeywords = keywords.filter(kw =>
    !currentSkills.some(skill => skill.includes(kw.toLowerCase()))
  );

  if (missingKeywords.length > 0) {
    suggestionsContainer.innerHTML = `
      <div style="padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: 0.5rem; border-left: 4px solid var(--primary-500);">
        <strong style="color: var(--primary-700);">
            ${isDefault ? '💡 Genel Tavsiyeler:' : '💡 AI Önerisi:'}
        </strong>
        <p style="margin: 0.5rem 0; font-size: 0.875rem; color: var(--gray-700);">
          ${isDefault ? 'Bu pozisyon için genel yetenek önerileri:' : 'Bu pozisyon için önerilen anahtar kelimeler:'}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
          ${missingKeywords.slice(0, 5).map(kw =>
      `<button class="btn btn-sm" style="padding: 0.25rem 0.75rem; background: white; color: var(--primary-600); border: 1px solid var(--primary-300);" onclick="addSkill('${kw}')">${kw}</button>`
    ).join('')}
        </div>
      </div>
    `;
  } else {
    suggestionsContainer.innerHTML = `
      <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; border-left: 4px solid var(--success);">
        <strong style="color: var(--success);">✓ Harika!</strong>
        <span style="margin-left: 0.5rem; font-size: 0.875rem; color: var(--gray-700);">Yetenekleriniz bu pozisyon için iyi optimize edilmiş.</span>
      </div>
    `;
  }
}

function addSkill(skill) {
  const skillsInput = document.getElementById('skills');
  const currentSkills = skillsInput.value;

  if (currentSkills) {
    skillsInput.value = currentSkills + ', ' + skill;
  } else {
    skillsInput.value = skill;
  }

  updatePreview();
  analyzeKeywords();
}

// ===================================
// CV Score Calculation
// ===================================
function calculateScore() {
  let score = 0;
  const maxScore = 100;

  // Personal Information (25 points)
  if (document.getElementById('fullName').value) score += 5;
  if (document.getElementById('jobTitle').value) score += 5;
  if (document.getElementById('email').value) score += 5;
  if (document.getElementById('phone').value) score += 5;
  if (document.getElementById('location').value) score += 3;
  if (document.getElementById('linkedin').value) score += 2;

  // Professional Summary (15 points)
  const summary = document.getElementById('summary').value;
  if (summary) {
    score += 10;
    if (summary.length > 100) score += 5; // Detailed summary
  }

  // Work Experience (30 points)
  const experienceItems = document.querySelectorAll('.experience-item');
  let experienceCount = 0;
  experienceItems.forEach(item => {
    const position = item.querySelector('.exp-position').value;
    const company = item.querySelector('.exp-company').value;
    const description = item.querySelector('.exp-description').value;

    if (position && company) {
      experienceCount++;
      score += 10;
      if (description && description.length > 50) score += 5; // Detailed description
    }
  });
  if (experienceCount >= 2) score += 5; // Multiple experiences

  // Education (15 points)
  const educationItems = document.querySelectorAll('.education-item');
  let educationCount = 0;
  educationItems.forEach(item => {
    const degree = item.querySelector('.edu-degree').value;
    const school = item.querySelector('.edu-school').value;

    if (degree && school) {
      educationCount++;
      score += 10;
    }
  });
  if (educationCount >= 1) score += 5;

  // Skills (15 points)
  const skills = document.getElementById('skills').value.split(',').filter(s => s.trim());
  if (skills.length >= 3) score += 5;
  if (skills.length >= 5) score += 5;
  if (skills.length >= 8) score += 5;

  // Cap at max score
  score = Math.min(score, maxScore);

  // Update score display with animation
  const scoreElement = document.getElementById('cvScore');
  const currentScore = parseInt(scoreElement.textContent) || 0;
  animateScore(currentScore, score, scoreElement);

  // Update score badge color
  const scoreBadge = document.querySelector('.score-badge');
  if (score >= 80) {
    scoreBadge.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  } else if (score >= 60) {
    scoreBadge.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  } else {
    scoreBadge.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  }
}

function animateScore(start, end, element) {
  const duration = 500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}


// ===================================
// Accordion Logic
// ===================================
function toggleSection(sectionId) {
  const sections = document.querySelectorAll('.form-section');
  const clickedSection = document.getElementById(sectionId);
  const isOpen = clickedSection.classList.contains('active');

  // Close all sections first (Accordion behavior)
  sections.forEach(sec => {
    sec.classList.remove('active');
  });

  // If it was closed, open it. If it was open, leave it closed (toggle).
  if (!isOpen) {
    clickedSection.classList.add('active');
  }
}

// ===================================
// PDF Export
// ===================================
function exportToPDF() {
  // Use browser's print functionality
  const printContent = document.getElementById('cvPreview').cloneNode(true);

  // Create a new window for printing
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CV - ${document.getElementById('fullName').value || 'Özgeçmiş'}</title>
      <link rel="stylesheet" href="styles.css">
      <style>
        body { margin: 0; padding: 20px; background: white; }
        @media print {
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      ${printContent.outerHTML}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 100);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ===================================
// Local Storage Management
// ===================================
function saveToLocalStorage() {
  const data = {
    personal: {
      fullName: document.getElementById('fullName').value,
      jobTitle: document.getElementById('jobTitle').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      linkedin: document.getElementById('linkedin').value
    },
    summary: document.getElementById('summary').value,
    skills: document.getElementById('skills').value,
    template: currentTemplate
  };

  localStorage.setItem('cvBuilderData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('cvBuilderData');
  if (saved) {
    try {
      const data = JSON.parse(saved);

      // Load personal information
      if (data.personal) {
        document.getElementById('fullName').value = data.personal.fullName || '';
        document.getElementById('jobTitle').value = data.personal.jobTitle || '';
        document.getElementById('email').value = data.personal.email || '';
        document.getElementById('phone').value = data.personal.phone || '';
        document.getElementById('location').value = data.personal.location || '';
        document.getElementById('linkedin').value = data.personal.linkedin || '';
      }

      // Load summary
      document.getElementById('summary').value = data.summary || '';

      // Load skills
      document.getElementById('skills').value = data.skills || '';

      // Load template
      if (data.template) {
        currentTemplate = data.template;
        document.getElementById('templateSelect').value = data.template;
        changeTemplate();
      }

      updatePreview();
      analyzeKeywords();
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }
}

// ===================================
// Smooth Scrolling for Navigation
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// ===================================
// CV History Management
// ===================================
let savedCVs = [];
let currentCVId = null;

// Load saved CVs on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedCVs();
  renderCVList();
});

async function loadSavedCVs() {
  window.savedCVsLoaded = true;
  const user = await getCurrentUserSafe();

  if (user && window.supabaseClient) {
    // Load from Supabase
    try {
      const { data, error } = await window.supabaseClient
        .from('cvs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      savedCVs = data.map(row => ({
        id: row.id,
        name: row.name,
        template: row.template,
        lastModified: row.updated_at,
        ...row.content
      }));
    } catch (e) {
      console.error('Error loading CVs from Supabase:', e);
      showNotification('CV\'ler yüklenirken hata oluştu ❌');
    }

    // CHECK FOR LOCAL CVS TO MIGRATE
    const localCVsRaw = localStorage.getItem('savedCVs');
    if (localCVsRaw) {
      try {
        const localCVs = JSON.parse(localCVsRaw);
        if (localCVs.length > 0) {
          console.log('Migrating local CVs to Cloud...', localCVs);
          showNotification('Yerel CV\'ler buluta taşınıyor... ☁️');

          for (const cv of localCVs) {
            // Check if this CV already exists in Supabase (by name/structure? or just simple blind upload)
            // Blind upload is safer to avoid data loss, Supabase will generate new ID
            const { error: uploadError } = await window.supabaseClient
              .from('cvs')
              .insert({
                user_id: user.id,
                name: cv.name || 'İsimsiz CV (Yerel)',
                template: cv.template || 'modern',
                content: {
                  personal: cv.personal,
                  summary: cv.summary,
                  experience: cv.experience,
                  education: cv.education,
                  skills: cv.skills,
                  score: cv.score
                },
                updated_at: new Date().toISOString()
              });

            if (uploadError) console.error('Migration failed for CV:', cv.name, uploadError);
          }

          // Clear local storage after migration attempt
          localStorage.removeItem('savedCVs');
          showNotification('CV\'ler başarıyla eşitlendi! ✅');

          // Reload from Supabase
          await loadSavedCVs();
          return; // Stop execution here as loadSavedCVs will run again
        }
      } catch (e) {
        console.error('Migration Error:', e);
      }
    }
  } else {
    // Load from LocalStorage (Guest)
    const saved = localStorage.getItem('savedCVs');
    if (saved) {
      try {
        savedCVs = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved CVs:', e);
        savedCVs = [];
      }
    }
  }

  // Update list if we are on dashboard
  if (document.getElementById('cvList')) {
    renderCVList();
  }

  // If editing, load the specific CV content
  const editId = localStorage.getItem('editCVId');
  if (editId && window.location.pathname.includes('editor.html')) {
    loadCV(editId);
    localStorage.removeItem('editCVId');
  }
}

async function getCurrentUserSafe() {
  if (!window.supabaseClient) return null;
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  return session?.user || null;
}

function saveCVsToStorage() {
  localStorage.setItem('savedCVs', JSON.stringify(savedCVs));
}

async function saveCurrentCV() {
  const user = await getCurrentUserSafe();
  const fullName = document.getElementById('fullName').value || 'İsimsiz CV';
  const jobTitle = document.getElementById('jobTitle').value || 'Pozisyon Belirtilmemiş';

  // Collect all form data
  const cvData = {
    personal: {
      fullName: document.getElementById('fullName').value,
      jobTitle: document.getElementById('jobTitle').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      linkedin: document.getElementById('linkedin').value
    },
    summary: document.getElementById('summary').value,
    experience: Array.from(document.querySelectorAll('.experience-item')).map(item => ({
      position: item.querySelector('.exp-position').value,
      company: item.querySelector('.exp-company').value,
      date: item.querySelector('.exp-date').value,
      description: item.querySelector('.exp-description').value
    })),
    education: Array.from(document.querySelectorAll('.education-item')).map(item => ({
      degree: item.querySelector('.edu-degree').value,
      school: item.querySelector('.edu-school').value,
      date: item.querySelector('.edu-date').value
    })),
    skills: document.getElementById('skills').value,
    score: parseInt(document.getElementById('cvScore').textContent) || 0
  };

  const name = `${fullName} - ${jobTitle}`;
  const now = new Date().toISOString();

  if (user) {
    // Save to Supabase
    try {
      const payload = {
        user_id: user.id,
        name: name,
        template: currentTemplate,
        content: cvData,
        updated_at: now
      };

      if (currentCVId && currentCVId.length > 10) {
        // Assuming UUID length > 10, whereas legacy timestamp IDs are shorter? timestamp is 13 chars. 
        // Actually timestamp IDs are strings of numbers. UUIDs have hyphens.
        // Better check: valid UUID? Or just try update if currentCVId exists.
        // For guest->auth transition, currentCVId might be timestamp.
        // If it looks like UUID, update. If not, insert new.
        if (currentCVId.includes('-')) {
          payload.id = currentCVId;
        }
        // If it's a timestamp ID, we treat it as new insert for Supabase (it will get a new UUID)
      }

      const { data, error } = await window.supabaseClient
        .from('cvs')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      currentCVId = data.id;
      showNotification('CV buluta kaydedildi! ☁️✅');

      // Reload list to keep in sync
      await loadSavedCVs();

    } catch (e) {
      console.error('Supabase Save Error:', e);
      showNotification('Kaydetme hatası: ' + e.message + ' ❌');
    }

  } else {
    // Guest Mode (LocalStorage)
    const fullCV = {
      id: currentCVId || Date.now().toString(),
      name: name,
      template: currentTemplate,
      lastModified: now,
      ...cvData
    };

    // Update or add CV
    const existingIndex = savedCVs.findIndex(cv => cv.id === fullCV.id);
    if (existingIndex >= 0) {
      savedCVs[existingIndex] = fullCV;
    } else {
      savedCVs.unshift(fullCV);
      currentCVId = fullCV.id;
    }

    saveCVsToStorage();
    renderCVList();
    showNotification('CV tarayıcıya kaydedildi! ✅');
  }
}

function loadCV(cvId) {
  // If we are on dashboard, save ID and redirect
  if (window.location.pathname.includes('dashboard.html')) {
    localStorage.setItem('editCVId', cvId);
    window.location.href = 'editor.html';
    return;
  }

  // If we are on editor, continue with loading
  const cv = savedCVs.find(c => c.id === cvId);
  if (!cv) return;

  currentCVId = cvId;

  // Load personal information
  document.getElementById('fullName').value = cv.personal.fullName || '';
  document.getElementById('jobTitle').value = cv.personal.jobTitle || '';
  document.getElementById('email').value = cv.personal.email || '';
  document.getElementById('phone').value = cv.personal.phone || '';
  document.getElementById('location').value = cv.personal.location || '';
  document.getElementById('linkedin').value = cv.personal.linkedin || '';

  // Load summary
  document.getElementById('summary').value = cv.summary || '';

  // Load skills
  document.getElementById('skills').value = cv.skills || '';

  // Load template
  currentTemplate = cv.template || 'modern';
  if (document.getElementById('templateSelect')) {
    document.getElementById('templateSelect').value = currentTemplate;
    changeTemplate();
  }

  // Clear and load experience
  const expContainer = document.getElementById('experienceContainer');
  if (expContainer) {
    expContainer.innerHTML = '';
    if (cv.experience && cv.experience.length > 0) {
      cv.experience.forEach((exp, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'experience-item';
        newItem.setAttribute('data-index', index);
        newItem.innerHTML = `
            <div class="form-group">
              <label class="form-label">Pozisyon</label>
              <input type="text" class="form-input exp-position" value="${exp.position || ''}" oninput="updatePreview()">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Şirket</label>
                <input type="text" class="form-input exp-company" value="${exp.company || ''}" oninput="updatePreview()">
              </div>
              <div class="form-group">
                <label class="form-label">Tarih</label>
                <input type="text" class="form-input exp-date" value="${exp.date || ''}" oninput="updatePreview()">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Açıklama</label>
              <textarea class="form-textarea exp-description" oninput="updatePreview()">${exp.description || ''}</textarea>
              <button class="btn btn-secondary btn-sm mt-1" onclick="generateBulletPointsWithAI(${index})" type="button">✨ AI ile Oluştur</button>
            </div>
            ${index > 0 ? `<button class="btn btn-outline btn-sm mt-1" onclick="removeExperience(${index})">Kaldır</button>` : ''}
            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
          `;
        expContainer.appendChild(newItem);
      });
    }
  }

  // Clear and load education
  const eduContainer = document.getElementById('educationContainer');
  if (eduContainer) {
    eduContainer.innerHTML = '';
    if (cv.education && cv.education.length > 0) {
      cv.education.forEach((edu, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'education-item';
        newItem.setAttribute('data-index', index);
        newItem.innerHTML = `
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Derece</label>
                <input type="text" class="form-input edu-degree" value="${edu.degree || ''}" oninput="updatePreview()">
              </div>
              <div class="form-group">
                <label class="form-label">Tarih</label>
                <input type="text" class="form-input edu-date" value="${edu.date || ''}" oninput="updatePreview()">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Okul</label>
              <input type="text" class="form-input edu-school" value="${edu.school || ''}" oninput="updatePreview()">
            </div>
            ${index > 0 ? `<button class="btn btn-outline btn-sm mt-1" onclick="removeEducation(${index})">Kaldır</button>` : ''}
            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
          `;
        eduContainer.appendChild(newItem);
      });
    }
  }

  updatePreview();
  if (typeof analyzeKeywords === 'function') analyzeKeywords();

  // Scroll to editor
  const editorSection = document.getElementById('editor');
  if (editorSection) {
    editorSection.scrollIntoView({ behavior: 'smooth' });
  }

  showNotification('CV yüklendi! 📄');
}

async function deleteCV(cvId) {
  const confirmed = await showConfirm(
    'Bu CV\'yi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    'CV Siliniyor',
    'Evet, Sil',
    true
  );

  if (!confirmed) return;

  const user = await getCurrentUserSafe();

  if (user && window.supabaseClient) {
    // Supabase Delete
    try {
      const { error } = await window.supabaseClient
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) throw error;

      showNotification('CV buluttan silindi! 🗑️');
      await loadSavedCVs(); // Refresh list

      if (currentCVId === cvId) {
        currentCVId = null;
        // Optionally clear editor if open
        if (window.location.pathname.includes('editor.html')) {
          newCV(); // Reset editor
        }
      }

    } catch (e) {
      console.error('Delete Error:', e);
      showNotification('Silme hatası: ' + e.message + ' ❌');
    }
  } else {
    // LocalStorage Delete
    savedCVs = savedCVs.filter(cv => cv.id !== cvId);
    if (currentCVId === cvId) {
      currentCVId = null;
    }
    saveCVsToStorage();
    renderCVList();
    showNotification('CV silindi! 🗑️');
  }
}

function duplicateCV(cvId) {
  const cv = savedCVs.find(c => c.id === cvId);
  if (!cv) return;

  const newCV = {
    ...cv,
    id: Date.now().toString(),
    name: cv.name + ' (Kopya)',
    lastModified: new Date().toISOString()
  };

  savedCVs.unshift(newCV);
  saveCVsToStorage();
  renderCVList();
  showNotification('CV kopyalandı! 📋');
}

async function newCV() {
  // Confirm if there are unsaved changes (simple check: if name or job title has value)
  const hasContent = document.getElementById('fullName').value.trim() !== '' ||
    document.getElementById('jobTitle').value.trim() !== '';

  if (hasContent) {
    const confirmed = await showConfirm(
      'Mevcut CV\'yi temizleyip yeni bir sayfa açmak istediğinizden emin misiniz? Kaydedilmemiş değişiklikler kaybolacak.',
      'Yeni CV Oluştur',
      'Evet, Oluştur',
      true
    );

    if (!confirmed) return;
  }

  currentCVId = null;

  // Clear all text inputs
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => input.value = '');

  // Reset Experience to a single empty item
  const experienceContainer = document.getElementById('experienceContainer');
  experienceContainer.innerHTML = `
      <div class="experience-item" data-index="0">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pozisyon</label>
            <input type="text" class="form-input exp-position" oninput="updatePreview()" placeholder="Kıdemli Mimar / Satış Müdürü / Öğretmen">
          </div>
          <div class="form-group">
            <label class="form-label">Şirket</label>
            <input type="text" class="form-input exp-company" oninput="updatePreview()" placeholder="Örn: Global Yapı A.Ş.">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Açıklama</label>
          <div style="display: flex; gap: 0.5rem; align-items: start;">
            <textarea class="form-textarea exp-description" rows="4" oninput="updatePreview()" placeholder="• Projeler yönettim..."></textarea>
            <button class="btn-ai-mini" onclick="generateBulletPointsWithAI(0)" title="AI ile Yaz">✨</button>
          </div>
        </div>
        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
      </div>`;

  // Reset Education to a single empty item
  const educationContainer = document.getElementById('educationContainer');
  educationContainer.innerHTML = `
      <div class="education-item" data-index="0">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Derece</label>
            <input type="text" class="form-input edu-degree" oninput="updatePreview()" placeholder="Lisans / Yüksek Lisans">
          </div>
          <div class="form-group">
            <label class="form-label">Tarih</label>
            <input type="text" class="form-input edu-date" oninput="updatePreview()" placeholder="Örn: 2015 - 2019">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Okul</label>
          <input type="text" class="form-input edu-school" oninput="updatePreview()" placeholder="Örn: Mimar Sinan Güzel Sanatlar Üniversitesi">
        </div>
        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
      </div>`;

  // Clear global state/storage for sure
  localStorage.removeItem('cvBuilderData');
  saveToLocalStorage(); // This will save the now-empty fields to storage

  // Reset Score and other UI elements
  document.getElementById('cvScore').textContent = '0';
  animateScore(0, 0, document.getElementById('cvScore'));

  // Explicitly clear preview
  updatePreview();
  showNotification('Yeni CV sayfası açıldı! 📄');
}

function renderCVList() {
  const container = document.getElementById('cvList');
  const emptyState = document.getElementById('emptyState');

  if (savedCVs.length === 0) {
    emptyState.style.display = 'block';
    container.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  container.style.display = 'grid';

  container.innerHTML = savedCVs.map(cv => {
    const date = new Date(cv.lastModified);
    const formattedDate = date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="cv-card">
        <div class="cv-card-header">
           <div class="cv-card-icon">📄</div>
        </div>
        <div class="cv-card-body">
            <h3 class="cv-card-title">${cv.name}</h3>
            <div class="cv-card-meta">
               <span class="cv-card-template-badge">${cv.template || 'Modern'}</span>
               <span>📅 ${formattedDate.split(' ')[0]}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                 <div style="flex: 1; height: 6px; background: #f3f4f6; border-radius: 99px; overflow: hidden;">
                    <div style="width: ${cv.score || 0}%; height: 100%; background: var(--gradient-primary);"></div>
                 </div>
                 <span style="font-size: 0.75rem; font-weight: 600; color: var(--gray-600);">${cv.score || 0}%</span>
            </div>
        </div>
        <div class="cv-card-actions">
          <button class="cv-card-btn cv-card-btn-primary" onclick="loadCV('${cv.id}')">✏️ Düzenle</button>
          <button class="cv-card-btn cv-card-btn-primary" onclick="duplicateCV('${cv.id}')">📋 Kopyala</button>
          <button class="cv-card-btn cv-card-btn-danger" onclick="deleteCV('${cv.id}')" title="Sil">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid #667eea;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===================================
// AI Chat Assistant
// ===================================
let chatOpen = false;
let chatHistory = [];

function toggleChat() {
  const widget = document.getElementById('aiChatWidget');
  const fab = document.getElementById('aiChatFab');

  chatOpen = !chatOpen;

  if (chatOpen) {
    widget.classList.add('open');
    fab.style.display = 'none';
  } else {
    widget.classList.remove('open');
    fab.style.display = 'flex';
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, 'user');
  input.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Get AI response
  try {
    const response = await getAIResponse(message);
    removeTypingIndicator();
    addMessageToChat(response, 'ai');
  } catch (error) {
    removeTypingIndicator();
    addMessageToChat('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'ai');
    console.error('AI Error:', error);
  }
}

function sendQuickMessage(message) {
  document.getElementById('chatInput').value = message;
  sendMessage();
}

function addMessageToChat(message, sender) {
  const messagesContainer = document.getElementById('chatMessages');

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? '👤' : '🤖';

  const content = document.createElement('div');
  content.className = 'message-content';

  const p = document.createElement('p');
  p.innerHTML = message.replace(/\n/g, '<br>');
  content.appendChild(p);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Save to history
  chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatMessages');

  const indicator = document.createElement('div');
  indicator.className = 'chat-message ai-message';
  indicator.id = 'typingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '🤖';

  const content = document.createElement('div');
  content.className = 'typing-indicator';
  content.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  indicator.appendChild(avatar);
  indicator.appendChild(content);
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

async function getAIResponse(userMessage) {
  // Get current CV context
  const cvContext = {
    fullName: document.getElementById('fullName').value,
    jobTitle: document.getElementById('jobTitle').value,
    summary: document.getElementById('summary').value,
    skills: document.getElementById('skills').value,
    score: parseInt(document.getElementById('cvScore').textContent) || 0
  };

  // Create context-aware prompt with CV-only focus
  const systemPrompt = `Sen bir CV oluşturma uzmanı AI asistanısın. SADECE özgeçmiş (CV) hazırlama konusunda yardımcı oluyorsun.

ÖNEMLİ KURALLAR:
1. SADECE CV ile ilgili konularda yardım et (profesyonel özet, iş deneyimi, yetenekler, eğitim, CV formatı, ATS optimizasyonu, vb.)
2. CV ile ilgili OLMAYAN sorulara şu şekilde yanıt ver: "Üzgünüm, ben sadece CV oluşturma konusunda yardımcı olan bir AI asistanıyım. Bu konuda size yardımcı olamam. CV hazırlama, profesyonel özet yazma, iş deneyimi açıklama veya yetenekler hakkında sorularınız varsa yardımcı olabilirim!"
3. Türkçe, kısa ve öz cevaplar ver
4. Pratik, uygulanabilir öneriler sun

Kullanıcının mevcut CV bilgileri:
- İsim: ${cvContext.fullName || 'Belirtilmemiş'}
- Pozisyon: ${cvContext.jobTitle || 'Belirtilmemiş'}
- CV Skoru: ${cvContext.score}/100
- Yetenekler: ${cvContext.skills || 'Belirtilmemiş'}

CV ile ilgili konular: profesyonel özet, iş deneyimi açıklama, yetenek listesi, eğitim bilgileri, CV formatı, ATS optimizasyonu, başvuru mektubu, LinkedIn profili, kariyer hedefleri, başarı metrikleri, anahtar kelimeler.`;

  const fullPrompt = `${systemPrompt}\n\nKullanıcı sorusu: ${userMessage}`;

  try {
    console.log('Sending request to Gemini API...');
    console.log('Prompt:', fullPrompt);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      return aiResponse;
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API structure');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Return fallback with extremely clear diagnostic info
    const fallback = getFallbackResponse(userMessage);
    const apiPath = GEMINI_API_URL.split('com/')[1] || 'API Endpoint';
    return fallback + `\n\n*(Sistem notu: Bağlantı hatası. Lütfen sunucunun çalıştığından emin olun.)*`;
  }
}

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  // CV-related keywords
  const cvKeywords = ['cv', 'özgeçmiş', 'özet', 'summary', 'deneyim', 'experience', 'yetenek', 'skill',
    'eğitim', 'education', 'skor', 'score', 'iş', 'job', 'kariyer', 'career',
    'başvuru', 'application', 'mülakat', 'interview', 'linkedin', 'portfolio',
    'referans', 'reference', 'sertifika', 'certificate', 'proje', 'project'];

  const isAboutCV = cvKeywords.some(keyword => lowerMessage.includes(keyword));

  // If not about CV, politely decline
  if (!isAboutCV) {
    return `Üzgünüm, ben sadece CV oluşturma konusunda yardımcı olan bir AI asistanıyım. Bu konuda size yardımcı olamam. 😊

CV hazırlama, profesyonel özet yazma, iş deneyimi açıklama, yetenekler ekleme veya CV skorunuzu artırma konularında yardımcı olabilirim!`;
  }

  if (lowerMessage.includes('özet') || lowerMessage.includes('summary')) {
    return `Profesyonel özet yazarken:
• 3-4 cümle ile kendinizi tanıtın
• Deneyim yılınızı belirtin
• Uzmanlık alanlarınızı vurgulayın
• Ölçülebilir başarılarınızı ekleyin

Örnek: "5+ yıllık deneyime sahip yazılım geliştirici. React ve Node.js konusunda uzman. 10+ başarılı proje teslim etti."`;
  }

  if (lowerMessage.includes('deneyim') || lowerMessage.includes('experience')) {
    return `İş deneyimi açıklarken:
• Pozisyon ve şirket adını belirtin
• Tarih aralığını ekleyin
• Başarılarınızı madde madde yazın
• Sayısal sonuçlar kullanın (%40 artış, 10+ proje)
• Eylem fiilleri ile başlayın (Geliştirdim, Yönettim, Optimize ettim)`;
  }

  if (lowerMessage.includes('yetenek') || lowerMessage.includes('skill')) {
    return `Yetenekler bölümü için:
• Pozisyonunuzla ilgili teknik yetenekleri ekleyin
• 5-10 arası yetenek ideal
• Hem teknik hem de soft skills ekleyin
• Anahtar kelimeleri kullanın
• Seviye belirtmeyin, sadece yeteneği yazın`;
  }

  if (lowerMessage.includes('skor') || lowerMessage.includes('score')) {
    return `Mevcut skorunuz: ${parseInt(document.getElementById('cvScore').textContent) || 0}/100

Skoru artırmak için:
• Tüm zorunlu alanları doldurun
• Detaylı açıklamalar yazın
• Birden fazla deneyim ekleyin
• 5+ yetenek listeleyin
• Profesyonel özet ekleyin`;
  }

  if (lowerMessage.includes('eğitim') || lowerMessage.includes('education')) {
    return `Eğitim bölümü için:
• Derece/diploma adını yazın
• Üniversite/okul adını ekleyin
• Mezuniyet tarihini belirtin
• GPA'yı sadece 3.0+ ise ekleyin
• İlgili dersleri veya başarıları ekleyebilirsiniz`;
  }

  if (lowerMessage.includes('linkedin')) {
    return `LinkedIn profili için:
• CV'nizdeki bilgilerle tutarlı olun
• Profesyonel profil fotoğrafı kullanın
• Özel URL oluşturun (linkedin.com/in/adiniz)
• CV'nizde LinkedIn URL'nizi mutlaka ekleyin
• Profil özetiniz CV özetinizle uyumlu olmalı`;
  }

  return `Size CV oluşturma konusunda yardımcı olabilirim! 📄

Şunlar hakkında soru sorabilirsiniz:
• Profesyonel özet yazma
• İş deneyimi açıklama
• Yetenek ekleme
• CV skorunu artırma
• Eğitim bilgileri
• LinkedIn optimizasyonu`;
}

// ===================================
// AI Content Generation
// ===================================
async function generateSummaryWithAI() {
  const jobTitle = document.getElementById('jobTitle').value;
  const skills = document.getElementById('skills').value;

  if (!jobTitle) {
    showNotification('Lütfen önce meslek unvanınızı girin! 💼');
    return;
  }

  showNotification('AI profesyonel özet oluşturuyor... ⏳');

  const prompt = `Bir ${jobTitle} için profesyonel CV özeti yaz. 
  
Yetenekler: ${skills || 'Belirtilmemiş'}

Kurallar:
- Türkçe yaz
- 3-4 cümle olsun
- Profesyonel ve etkileyici olsun
- Deneyim ve uzmanlık vurgusu yap
- Ölçülebilir başarılar ekle
- Sadece özet metnini yaz, başka açıklama ekleme`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('AI yanıtı geçersiz veya boş döndü.');
    }

    const generatedSummary = data.candidates[0].content.parts[0].text.trim();

    document.getElementById('summary').value = generatedSummary;
    updatePreview();
    showNotification('Profesyonel özet oluşturuldu! ✅');
  } catch (error) {
    console.error('AI Error:', error);
    showNotification('Hata oluştu: ' + (error.message || 'Bilinmeyen hata') + ' ❌');
  }
}

async function generateBulletPointsWithAI(experienceIndex) {
  const expItems = document.querySelectorAll('.experience-item');
  const expItem = expItems[experienceIndex];

  if (!expItem) return;

  const position = expItem.querySelector('.exp-position').value;
  const company = expItem.querySelector('.exp-company').value;

  if (!position) {
    showNotification('Lütfen önce pozisyon adını girin! 💼');
    return;
  }

  showNotification('AI iş deneyimi açıklaması oluşturuyor... ⏳');

  const prompt = `${position} pozisyonu için ${company || 'bir şirkette'} çalışan birinin CV'sine yazılacak iş deneyimi açıklaması oluştur.

Kurallar:
- Türkçe yaz
- 3-5 madde halinde yaz
- Her madde • ile başlasın
- Eylem fiilleri kullan (Geliştirdim, Yönettim, Optimize ettim, vb.)
- Ölçülebilir sonuçlar ekle (%40 artış, 10+ proje gibi)
- Profesyonel ve etkileyici olsun
- Sadece maddeleri yaz, başka açıklama ekleme`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error('API isteği başarısız oldu');

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('AI yanıtı geçersiz.');
    }

    const generatedDescription = data.candidates[0].content.parts[0].text.trim();

    expItem.querySelector('.exp-description').value = generatedDescription;
    updatePreview();
    showNotification('İş deneyimi açıklaması oluşturuldu! ✅');
  } catch (error) {
    console.error('AI Error:', error);
    showNotification('Hata oluştu: ' + (error.message || 'Bilinmeyen hata') + ' ❌');
  }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
// ===================================
// Job Matcher Feature
// ===================================
function openJobMatcher() {
  document.getElementById('jobMatcherModal').classList.add('active');
  document.getElementById('jobMatcherInputStep').style.display = 'block';
  document.getElementById('jobMatcherLoadingStep').style.display = 'none';
  document.getElementById('jobMatcherResultStep').style.display = 'none';
}

function closeJobMatcher() {
  document.getElementById('jobMatcherModal').classList.remove('active');
}

function resetJobMatcher() {
  document.getElementById('jobDescriptionInput').value = '';
  document.getElementById('jobMatcherResultStep').style.display = 'none';
  document.getElementById('jobMatcherInputStep').style.display = 'block';
}

async function analyzeJobMatch() {
  const jobDescription = document.getElementById('jobDescriptionInput').value.trim();

  if (!jobDescription) {
    showNotification('Lütfen bir iş ilanı metni girin! ⚠️');
    return;
  }

  // Show loading
  document.getElementById('jobMatcherInputStep').style.display = 'none';
  document.getElementById('jobMatcherLoadingStep').style.display = 'block';

  // Gather CV Data
  const cvData = {
    fullName: document.getElementById('fullName').value,
    jobTitle: document.getElementById('jobTitle').value,
    summary: document.getElementById('summary').value,
    skills: document.getElementById('skills').value,
    experience: Array.from(document.querySelectorAll('.experience-item')).map(item => ({
      position: item.querySelector('.exp-position').value,
      company: item.querySelector('.exp-company').value,
      description: item.querySelector('.exp-description').value
    }))
  };

  const prompt = `
    Sen uzman bir İşe Alım Yöneticisi ve Kariyer Koçusun.
    Görevin: Aşağıdaki CV ile verilen iş ilanını karşılaştırmak ve detaylı bir uyumluluk analizi yapmak.

    CV VERİSİ:
    - Pozisyon: ${cvData.jobTitle}
    - Özet: ${cvData.summary}
    - Yetenekler: ${cvData.skills}
    - Deneyim: ${JSON.stringify(cvData.experience)}

    İŞ İLANI:
    ${jobDescription}

    Lütfen yanıtını SADECE aşağıdaki JSON formatında ver (başka yazı yazma):
    {
      "score": (0 ile 100 arası bir sayı),
      "analysis": "Kısa ve öz genel değerlendirme (2 cümle)",
      "missingKeywords": ["Eksik yetenek 1", "Eksik yetenek 2", "Eksik yetenek 3"],
      "matchingKeywords": ["Eşleşen yetenek 1", "Eşleşen yetenek 2"],
      "suggestions": ["Somut tavsiye 1", "Somut tavsiye 2", "Somut tavsiye 3"]
    }
  `;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error('API Request Failed');

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('AI yanıtı geçersiz.');
    }

    let textResponse = data.candidates[0].content.parts[0].text;

    // Clean markdown code blocks if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(textResponse);
    renderMatchResults(result);

  } catch (error) {
    console.error('Job Match Error:', error);
    showNotification('Analiz sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') + ' ❌');
    resetJobMatcher();
  }
}

function renderMatchResults(result) {
  // Hide loading, show results
  document.getElementById('jobMatcherLoadingStep').style.display = 'none';
  document.getElementById('jobMatcherResultStep').style.display = 'block';

  // Animate Score
  animateRingScore(result.score);

  // Set Texts
  document.getElementById('matchAnalysisText').textContent = result.analysis;

  // Render Lists
  const missingContainer = document.getElementById('missingKeywordsList');
  missingContainer.innerHTML = result.missingKeywords.length
    ? result.missingKeywords.map(k => `<span class="tag-missing">${k}</span>`).join('')
    : '<span class="tag-success">Tüm anahtar kelimeler mevcut! 👏</span>';

  const matchingContainer = document.getElementById('matchingKeywordsList');
  matchingContainer.innerHTML = result.matchingKeywords.map(k => `<span class="tag-match">${k}</span>`).join('');

  const suggestionsContainer = document.getElementById('matchSuggestionsList');
  suggestionsContainer.innerHTML = result.suggestions.map(s => `<li>${s}</li>`).join('');

  // Update Title based on Score
  const title = document.getElementById('matchScoreTitle');
  if (result.score >= 80) title.textContent = "Harika Uyum! 🌟";
  else if (result.score >= 60) title.textContent = "İyi Uyum 👍";
  else title.textContent = "Geliştirilmeli 🛠️";
}

function animateRingScore(score) {
  const circle = document.getElementById('scoreRingProgress');
  const valueText = document.getElementById('matchScoreValue');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  if (score >= 80) circle.style.stroke = '#10b981'; // Green
  else if (score >= 60) circle.style.stroke = '#f59e0b'; // Orange
  else circle.style.stroke = '#ef4444'; // Red

  // Animate
  setTimeout(() => {
    circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Counter animation
  animateScore(0, score, valueText);
}


/* ===================================
   Template Preview System
   =================================== */

const dummyCVData = {
  personal: {
    fullName: 'Ali Yılmaz',
    jobTitle: 'Kıdemli Yazılım Mühendisi',
    email: 'ali.yilmaz@ornek.com',
    phone: '+90 555 123 45 67',
    location: 'İstanbul, Türkiye',
    linkedin: 'linkedin.com/in/aliyilmaz'
  },
  summary: '5+ yıl deneyimli, modern web teknolojilerinde uzmanlaşmış tutkulu yazılım mühendisi. Karmaşık problemleri çözmeyi sever, takım çalışmasına yatkın ve sürekli öğrenmeye açıktır. Ölçeklenebilir uygulamalar geliştirme konusunda tecrübelidir.',
  experience: [
    {
      title: 'Kıdemli Frontend Geliştirici',
      company: 'Teknoloji A.Ş.',
      location: 'İstanbul',
      startDate: '2021',
      endDate: 'Devam Ediyor',
      description: 'Büyük ölçekli e-ticaret platformunun arayüz geliştirmesi. React ve Redux kullanarak performans optimizasyonu sağlandı. Genç geliştiricilere mentorluk yapıldı.'
    },
    {
      title: 'Yazılım Geliştirici',
      company: 'Digital Çözümler',
      location: 'Ankara',
      startDate: '2019',
      endDate: '2021',
      description: 'Kurumsal müşteriler için web tabanlı yönetim panelleri geliştirildi. Müşteri ihtiyaçlarına uygun çözümler üretildi ve veritabanı tasarımları yapıldı.'
    }
  ],
  education: [
    {
      school: 'İstanbul Teknik Üniversitesi',
      degree: 'Bilgisayar Mühendisliği',
      location: 'İstanbul',
      startDate: '2015',
      endDate: '2019',
      description: '3.5/4.0 not ortalaması ile mezuniyet. Yapay zeka ve veri madenciliği üzerine bitirme projesi.'
    }
  ],
  skills: ['JavaScript', 'React.js', 'Node.js', 'TypeScript', 'HTML5 & CSS3', 'Git & GitHub', 'Agile/Scrum', 'SQL']
};

let previewTemplateId = '';

function openTemplatePreview(templateName) {
  previewTemplateId = templateName;
  const modal = document.getElementById('templatePreviewModal');
  const content = document.getElementById('templatePreviewContent');
  const title = document.getElementById('previewModalTitle');
  const useBtn = document.getElementById('useTemplateBtn');

  // Set modal title based on template
  const templateNames = {
    'modern': 'Modern Şablon',
    'professional': 'Profesyonel Şablon',
    'creative': 'Yaratıcı Şablon',
    'minimalist': 'Minimalist Şablon',
    'executive': 'Yönetici Şablonu',
    'tech': 'Teknoloji Şablonu'
  };
  title.textContent = templateNames[templateName] + ' Önizlemesi';

  // Configure "Use This Template" button
  useBtn.onclick = function () {
    selectTemplate(templateName);
    closeTemplatePreview();
  };

  // Render dummy CV
  content.innerHTML = renderCVHTML(dummyCVData);

  // Remove all template classes first
  content.classList.remove('template-modern', 'template-professional', 'template-creative', 'template-minimalist', 'template-executive', 'template-tech');

  // Apply specific styles if needed (reuse app logic somewhat)
  content.classList.add(`template-${templateName}`);

  // Reset inline styles
  content.style.borderLeft = '';
  content.style.borderTop = '';

  // Apply specific border styles manually to match app.js logic
  switch (templateName) {
    case 'modern': content.style.borderLeft = '4px solid #667eea'; break;
    case 'professional': content.style.borderLeft = '4px solid #3b82f6'; break;
    case 'creative': content.style.borderLeft = '4px solid #ec4899'; break;
  }

  // Show modal
  document.getElementById('templatePreviewModal').classList.add('active');
}

function closeTemplatePreview() {
  document.getElementById('templatePreviewModal').classList.remove('active');
}

function renderCVHTML(data) {
  // Helper to generate skills HTML
  const skillsHTML = data.skills.map(skill => `<span class="cv-skill-tag">${skill}</span>`).join('');

  // Helper to generate experience HTML
  const experienceHTML = data.experience.map(exp => `
    <div class="cv-item">
      <div class="cv-item-header">
        <div>
          <div class="cv-item-title">${exp.title}</div>
          <div class="cv-item-subtitle">${exp.company}, ${exp.location}</div>
        </div>
        <div class="cv-item-date">${exp.startDate} - ${exp.endDate}</div>
      </div>
      <div class="cv-item-description">${exp.description}</div>
    </div>
  `).join('');

  // Helper to generate education HTML
  const educationHTML = data.education.map(edu => `
    <div class="cv-item">
      <div class="cv-item-header">
        <div>
          <div class="cv-item-title">${edu.school}</div>
          <div class="cv-item-subtitle">${edu.degree}, ${edu.location}</div>
        </div>
        <div class="cv-item-date">${edu.startDate} - ${edu.endDate}</div>
      </div>
      <div class="cv-item-description">${edu.description}</div>
    </div>
  `).join('');

  return `
    <div class="cv-header">
      <h1 class="cv-name">${data.personal.fullName}</h1>
      <div class="cv-title">${data.personal.jobTitle}</div>
      <div class="cv-contact">
        <span>📧 ${data.personal.email}</span>
        <span>📱 ${data.personal.phone}</span>
        <span>📍 ${data.personal.location}</span>
        <span>🔗 ${data.personal.linkedin}</span>
      </div>
    </div>

    <div class="cv-body">
      <div class="cv-section" id="summarySection">
        <h3 class="cv-section-title">Özet</h3>
        <p>${data.summary}</p>
      </div>

      <div class="cv-section">
        <h3 class="cv-section-title">Deneyim</h3>
        ${experienceHTML}
      </div>

      <div class="cv-section">
        <h3 class="cv-section-title">Eğitim</h3>
        ${educationHTML}
      </div>

      <div class="cv-section">
        <h3 class="cv-section-title">Yetenekler</h3>
        <div class="cv-skills">
          ${skillsHTML}
        </div>
      </div>
    </div>
  `;
}

// ===================================
// Interview Simulator Logic
// ===================================
let currentInterviewType = '';
let currentQuestionIndex = 0;
let currentQuestionData = {}; // Stores question and tip

function openInterviewSimulator() {
  document.getElementById('interviewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  resetInterviewSimulator();
}

function closeInterviewSimulator() {
  document.getElementById('interviewModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function resetInterviewSimulator() {
  document.getElementById('interviewSetupStep').style.display = 'block';
  document.getElementById('interviewLoadingStep').style.display = 'none';
  document.getElementById('interviewSessionStep').style.display = 'none';
  currentQuestionIndex = 0;
  document.getElementById('userAnswerNotes').value = '';
}

async function startInterview(type) {
  currentInterviewType = type;
  document.getElementById('interviewSetupStep').style.display = 'none';
  document.getElementById('interviewLoadingStep').style.display = 'flex';

  await loadNextQuestion();
}

async function loadNextQuestion() {
  // UI Reset for new question
  document.getElementById('interviewLoadingStep').style.display = 'flex';
  document.getElementById('interviewSessionStep').style.display = 'none';
  document.getElementById('interviewFeedback').style.display = 'none';
  document.getElementById('showTipBtn').textContent = '👀 İpucu / Beklenen Cevap';
  document.getElementById('userAnswerNotes').value = '';

  currentQuestionIndex++;
  document.getElementById('questionNumber').textContent = currentQuestionIndex;

  // Prepare Context for AI
  const jobTitle = document.getElementById('jobTitle').value || 'Genel Pozisyon';
  const skills = document.getElementById('skills').value || 'Genel Yetenekler';
  // Check if elements exist before accessing properties
  const expItems = document.querySelectorAll('.experience-item');
  let experience = '';
  if (expItems.length > 0) {
    experience = Array.from(expItems).map(item => item.querySelector('.exp-position').value).join(', ');
  }

  // Construct Prompt based on Type
  let promptContext = `
    Sen profesyonel, sert ama adil bir mülakatçısın (Interviewer).
    Adayın Profili:
    - Pozisyon: ${jobTitle}
    - Yetenekler: ${skills}
    - Deneyim: ${experience}
    
    Mülakat Türü: ${currentInterviewType === 'technical' ? 'Teknik Mülakat (Zorlayıcı teknik detaylar sor)' :
      currentInterviewType === 'behavioral' ? 'Davranışsal (STAR tekniği gerektiren durumlar sor)' :
        'Senaryo Bazlı (Gerçek hayat problemi çözdür)'}
    
    GÖREV:
    Bu aday için ${currentQuestionIndex}. soruyu sor. 
    Lütfen sadece JSON formatında yanıt ver. JSON şu yapıda olmalı:
    {
      "question": "Soru metni buraya",
      "tip": "Bu soruya verilecek ideal cevabın ana hatları ve ipuçları buraya"
    }
    
    Soru gerçekten zorlayıcı ve ${jobTitle} pozisyonu için gerçekçi olsun.
    Asla "Merhaba" veya giriş cümlesi kurma, sadece JSON döndür.
  `;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptContext }] }] })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      let text = data.candidates[0].content.parts[0].text;
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        currentQuestionData = JSON.parse(text);

        // Typewriter effect with "Click to Skip"
        const questionElement = document.getElementById('interviewQuestion');
        questionElement.textContent = ''; // Clear previous

        const questionText = currentQuestionData.question;
        let i = 0;
        let typingTimeout;

        // Ensure cursor indicates interactivity
        questionElement.style.cursor = 'pointer';
        questionElement.title = 'Tamamını görmek için tıklayın';

        function typeWriter() {
          if (i < questionText.length) {
            questionElement.textContent += questionText.charAt(i);
            i++;
            typingTimeout = setTimeout(typeWriter, 30); // Speed of typing
          } else {
            // Done typing naturally
            questionElement.style.cursor = 'default';
            questionElement.onclick = null;
            questionElement.removeAttribute('title');
          }
        }

        // Click logic
        questionElement.onclick = function () {
          clearTimeout(typingTimeout);
          questionElement.textContent = questionText;
          questionElement.style.cursor = 'default';
          questionElement.onclick = null;
          questionElement.removeAttribute('title');
        };

        typeWriter();

        // Use marked if available, otherwise plain text
        if (typeof marked !== 'undefined') {
          document.getElementById('interviewTipContent').innerHTML = marked.parse(currentQuestionData.tip);
        } else {
          document.getElementById('interviewTipContent').textContent = currentQuestionData.tip;
        }

      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // Fallback if AI fails json format
        document.getElementById('interviewQuestion').textContent = text;
        document.getElementById('interviewTipContent').textContent = "AI yanıtı formatlayamadı, ancak soru yukarıdadır.";
      }
    }

    document.getElementById('interviewLoadingStep').style.display = 'none';
    document.getElementById('interviewSessionStep').style.display = 'flex';

  } catch (error) {
    console.error('Interview Error:', error);
    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    closeInterviewSimulator();
  }
}

function toggleInterviewTip() {
  const feedback = document.getElementById('interviewFeedback');
  const btn = document.getElementById('showTipBtn');

  if (feedback.style.display === 'none') {
    feedback.style.display = 'block';
    btn.textContent = '🙈 İpucunu Gizle';
  } else {
    feedback.style.display = 'none';
    btn.textContent = '👀 İpucu / Beklenen Cevap';
  }
}
/* ===================================
   Custom Confirmation Logic
   =================================== */
let confirmResolve = null;

function showConfirm(message, title = "Emin misiniz?", yesText = "Evet", isDestructive = false) {
  return new Promise((resolve) => {
    confirmResolve = resolve;

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const yesBtn = document.getElementById('confirmYesBtn');
    yesBtn.textContent = yesText;

    if (isDestructive) {
      yesBtn.style.background = '#ef4444'; // Red
      yesBtn.style.borderColor = '#ef4444';
    } else {
      yesBtn.style.background = 'var(--primary-600)'; // Blue/Primary
      yesBtn.style.borderColor = 'var(--primary-600)';
    }

    // Remove old listeners to prevent stacking
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.onclick = () => closeConfirmModal(true);

    document.getElementById('confirmModal').classList.add('active');
  });
}

function closeConfirmModal(result) {
  document.getElementById('confirmModal').classList.remove('active');
  if (confirmResolve) {
    confirmResolve(result);
    confirmResolve = null;
  }
}


