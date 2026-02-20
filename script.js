// Estado de la aplicación
let currentStage = 1;
const totalStages = 8;
const userAnswers = [];
let totalScore = 0;

// Elementos del DOM
const stages = document.querySelectorAll('.question-stage');
const steps = document.querySelectorAll('.step');
const progressFill = document.getElementById('progress-fill');
const sections = {
    question: document.getElementById('question-section'),
    data: document.getElementById('data-section'),
    result: document.getElementById('result-section')
};

// 🎵 Control de música
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');
let isMusicPlaying = true;

function initMusic() {
    music.volume = 0.4;
    
    const playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay bloqueado, esperamos interacción
            isMusicPlaying = false;
            musicStatus.textContent = 'Música: OFF';
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Música: OFF</span>';
        });
    }
    
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            music.pause();
            musicStatus.textContent = 'Música: OFF';
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Música: OFF</span>';
        } else {
            music.play();
            musicStatus.textContent = 'Música: ON';
            musicToggle.innerHTML = '<i class="fas fa-music"></i><span>Música: ON</span>';
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

// 🎬 Cambiar de etapa (pregunta)
function goToStage(stageNumber) {
    // Ocultar todas
    stages.forEach(s => s.style.display = 'none');
    // Mostrar actual
    document.getElementById(`stage-${stageNumber}`).style.display = 'flex';
    
    // Actualizar progreso
    steps.forEach((step, index) => {
        if (index + 1 <= stageNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Actualizar barra
    const progressPercent = ((stageNumber - 1) / (totalStages - 1)) * 100;
    progressFill.style.width = `${progressPercent}%`;
    
    currentStage = stageNumber;
}

// ✅ Selección de opción
function setupOptions() {
    document.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', function(e) {
            // Remover selección de hermanos
            const siblings = this.parentElement.children;
            Array.from(siblings).forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            // Guardar respuesta
            const stageId = this.closest('.question-stage').id;
            const stageNum = parseInt(stageId.split('-')[1]);
            const value = parseInt(this.dataset.value);
            userAnswers[stageNum - 1] = value;
            
            // Feedback visual
            this.style.transform = 'scale(0.98)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
            
            // Avance automático
            setTimeout(() => {
                if (stageNum < totalStages) {
                    goToStage(stageNum + 1);
                } else {
                    // Última pregunta → ir a datos
                    sections.question.classList.remove('active');
                    sections.data.classList.add('active');
                }
            }, 800); // Espera elegante
        });
    });
}

// 📋 Formulario de datos
function setupDataForm() {
    document.getElementById('user-data-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            score: userAnswers.reduce((sum, val) => sum + val, 0),
            answers: userAnswers,
            timestamp: new Date().toISOString()
        };

        // Mostrar indicador de envío (opcional)
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;

        try {
            // 🔁 CAMBIA ESTA URL POR LA DE TU WEBHOOK (Make, Zapier, etc.)
            const webhookURL = 'https://services.leadconnectorhq.com/hooks/HFgqPVifwNR2SxrzGwEG/webhook-trigger/Z6G8KSgbSPhPDtXqmHRX'; 
            
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                console.warn('Webhook respondió con error:', response.status);
            }
        } catch (error) {
            console.error('Error al enviar a webhook:', error);
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Calcular score (ya lo tenemos en formData.score)
            totalScore = formData.score;
            document.getElementById('score-value').textContent = totalScore;

            // Personalizar diagnóstico
            let description = '';
            if (totalScore <= 10) description = 'Tu perfil es práctico y funcional. Buscas propiedades accesibles en zonas emergentes con potencial de revalorización.';
            else if (totalScore <= 20) description = 'Buscas equilibrio entre diseño y comodidad. Zonas consolidadas con buena conectividad son tu escenario ideal.';
            else if (totalScore <= 28) description = 'Perfil premium. Valoras la exclusividad, el diseño arquitectónico y las amenities de alto nivel.';
            else description = 'Te mueves en el segmento más exclusivo. Propiedades emblemáticas, localización privilegiada y máxima personalización.';
            
            document.getElementById('result-description').textContent = description;

            // Mostrar resultados
            sections.data.classList.remove('active');
            sections.result.classList.add('active');
        }
    });
}

// 📅 Botón de agendar
function setupSchedule() {
    document.getElementById('schedule-visit').addEventListener('click', function() {
        const name = document.getElementById('name').value || 'Cliente';
        const email = document.getElementById('email').value || '';
        const phone = document.getElementById('phone').value || '';
        const city = document.getElementById('city').value || '';

        // 🔁 CAMBIA ESTO POR TU ENLACE DE CALENDLY (u otro)
        const calendlyUrl = 'https://www.taskifydco.com/widget/booking/pu8oL9cIKaHcMw4S4TOZ';

        // Opcional: pasar datos como parámetros (si Calendly los acepta)
        const urlWithParams = `${calendlyUrl}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&location=${encodeURIComponent(city)}`;

        // Abrir en una nueva pestaña
        window.open(urlWithParams, '_blank');
    });
}

// 🚀 Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar solo la primera etapa
    stages.forEach((s, i) => s.style.display = i === 0 ? 'flex' : 'none');
    
    initMusic();
    setupOptions();
    setupDataForm();
    setupSchedule();
    
    // Pequeño efecto para el título del resultado
    setInterval(() => {
        const title = document.querySelector('.result-card h1');
        if (title) title.style.textShadow = '0 0 15px rgba(64,224,208,0.5)';
        setTimeout(() => title.style.textShadow = 'none', 800);
    }, 3000);
});
document.addEventListener('DOMContentLoaded', function() {
    // Si el iframe no se reproduce automáticamente, puedes intentar con esto
    // Pero no es necesario si los parámetros están bien.
});