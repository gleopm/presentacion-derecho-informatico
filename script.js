// Variables globales
let currentSlideIndex = 0;
const totalSlides = 11;

// Función principal para actualizar la presentación
function updatePresentation() {
    const slidesWrapper = document.getElementById('slidesWrapper');
    const progressFill = document.getElementById('progressFill');
    const currentSlideSpan = document.getElementById('currentSlide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Mover slides
    const translateX = -currentSlideIndex * 100;
    slidesWrapper.style.transform = `translateX(${translateX}vw)`;
    
    // Actualizar barra de progreso
    const progress = (currentSlideIndex / (totalSlides - 1)) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Actualizar contador
    currentSlideSpan.textContent = currentSlideIndex + 1;
    
    // Actualizar estado de botones
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === totalSlides - 1;
    
    // Actualizar display del total de slides
    document.getElementById('totalSlides').textContent = totalSlides;
    
    // Log para debug
    console.log(`Slide actual: ${currentSlideIndex + 1}/${totalSlides}`);
}

// Función para avanzar slide
function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        currentSlideIndex++;
        updatePresentation();
    }
}

// Función para retroceder slide
function previousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updatePresentation();
    }
}

// Función para ir a un slide específico
function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlideIndex = index;
        updatePresentation();
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando presentación...');
    
    // Obtener referencias a los botones
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Verificar que los botones existen
    if (!prevBtn || !nextBtn) {
        console.error('Botones de navegación no encontrados');
        return;
    }
    
    // Event listeners para los botones
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botón anterior clickeado');
        previousSlide();
    });
    
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botón siguiente clickeado');
        nextSlide();
    });
    
    // Navegación por teclado
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'Escape':
                // Salir de pantalla completa si está activo
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    });
    
    // Soporte para touch/swipe en móviles
    let startX = null;
    let startY = null;
    let startTime = null;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (startX === null || startY === null) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        
        const deltaX = startX - endX;
        const deltaY = startY - endY;
        const deltaTime = endTime - startTime;
        
        // Solo responder a swipes horizontales rápidos
        if (Math.abs(deltaX) > Math.abs(deltaY) && 
            Math.abs(deltaX) > 50 && 
            deltaTime < 300) {
            
            if (deltaX > 0) {
                nextSlide(); // Swipe izquierda (siguiente)
            } else {
                previousSlide(); // Swipe derecha (anterior)
            }
        }
        
        // Reset
        startX = null;
        startY = null;
        startTime = null;
    }, { passive: true });
    
    // Navegación por clic (opcional - dividir pantalla en zonas)
    document.addEventListener('click', function(e) {
        // No activar si se hace clic en controles o tarjetas de contenido
        if (e.target.closest('.controls') || 
            e.target.closest('.content-card') || 
            e.target.closest('.team-member') ||
            e.target.closest('.stat-card') ||
            e.target.closest('.example-item')) {
            return;
        }
        
        const rect = document.body.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const middleX = rect.width / 2;
        
        // Zona derecha = siguiente, zona izquierda = anterior
        if (clickX > middleX) {
            nextSlide();
        } else {
            previousSlide();
        }
    });
    
    // Inicializar la presentación
    updatePresentation();
    console.log('Presentación inicializada correctamente');
});

// Funciones para pantalla completa
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error al entrar en pantalla completa:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Función para auto-avance (opcional)
let autoAdvanceTimer;
let isAutoAdvanceActive = false;

function startAutoAdvance(intervalMs = 45000) {
    if (isAutoAdvanceActive) return;
    
    isAutoAdvanceActive = true;
    autoAdvanceTimer = setInterval(() => {
        if (currentSlideIndex < totalSlides - 1) {
            nextSlide();
        } else {
            stopAutoAdvance();
        }
    }, intervalMs);
    
    console.log('Auto-avance iniciado');
}

function stopAutoAdvance() {
    if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
        isAutoAdvanceActive = false;
        console.log('Auto-avance detenido');
    }
}

// Pausar auto-avance en interacción del usuario
['click', 'keydown', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
        if (isAutoAdvanceActive) {
            stopAutoAdvance();
        }
    });
});

// Función para exportar posición actual (útil para debug)
function getCurrentSlideInfo() {
    return {
        current: currentSlideIndex + 1,
        total: totalSlides,
        progress: ((currentSlideIndex / (totalSlides - 1)) * 100).toFixed(1) + '%'
    };
}

// Función para precargar imágenes (mejora la experiencia)
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
}

// Función para detectar si está en modo presentación
function isPresentationMode() {
    return document.fullscreenElement !== null;
}

// Funciones de utilidad para desarrolladores
window.presentationControls = {
    next: nextSlide,
    previous: previousSlide,
    goTo: goToSlide,
    getCurrentInfo: getCurrentSlideInfo,
    startAutoAdvance: startAutoAdvance,
    stopAutoAdvance: stopAutoAdvance,
    toggleFullscreen: toggleFullscreen
};

// Error handling para imágenes
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.log('Error cargando imagen:', this.src);
            this.style.display = 'none';
            const placeholder = this.parentElement.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        });
        
        img.addEventListener('load', function() {
            console.log('Imagen cargada:', this.src);
        });
    });
});

// Funciones adicionales para mejorar la experiencia
function addSlideTransitionEffects() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.addEventListener('transitionend', function() {
            if (index === currentSlideIndex) {
                console.log(`Transición completada para slide ${index + 1}`);
            }
        });
    });
}

// Llamar a funciones de inicialización adicionales
document.addEventListener('DOMContentLoaded', function() {
    addSlideTransitionEffects();
    preloadImages();
});

// Log de inicio
console.log('Script de presentación cargado');
console.log('Controles disponibles en window.presentationControls');
console.log('Teclas: ←→ (navegación), Space (siguiente), Home/End (inicio/fin), Esc (salir pantalla completa)');

// Exportar funciones principales para uso externo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        nextSlide,
        previousSlide,
        goToSlide,
        getCurrentSlideInfo,
        startAutoAdvance,
        stopAutoAdvance
    };
}
