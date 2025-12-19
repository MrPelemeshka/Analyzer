// main.js - только основная логика
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.main-header');

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Закрываем мобильное меню если открыто
                    if (hamburger && navMenu) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                    
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: targetPosition - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Header scroll effect
    let lastScrollY = window.scrollY;
    const headerHeight = header ? header.offsetHeight : 0;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = window.scrollY;
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step-item, .info-card').forEach(el => {
        observer.observe(el);
    });

    // Add loading states
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
            }
        });
    });

    // Инициализация Telegram обратной связи
    initializeTelegramFeedback();
});

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    .feature-card,
    .step-item,
    .info-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }

    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Telegram обратная связь
function initializeTelegramFeedback() {
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const modalClose = document.getElementById('modalClose');
    const telegramOptions = document.querySelectorAll('.telegram-option');

    // Открытие модального окна
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (feedbackModal) {
                feedbackModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Закрытие модального окна
    if (modalClose) {
        modalClose.addEventListener('click', function(e) {
            e.preventDefault();
            if (feedbackModal) {
                feedbackModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Закрытие по клику вне окна
    if (feedbackModal) {
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                feedbackModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Обработка выбора опции Telegram
    telegramOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.getAttribute('data-type');
            openTelegram(type);
        });
    });
}

function openTelegram(type) {
    const telegramUrls = {
        direct: 'https://t.me/KlimovOE',
        group: 'https://t.me/your_support_group' // Замените на вашу группу
    };

    const url = telegramUrls[type];
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        
        showNotification(type === 'direct' 
            ? 'Открываю Telegram...' 
            : 'Открываю группу поддержки...');

        const feedbackModal = document.getElementById('feedbackModal');
        if (feedbackModal) {
            feedbackModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

function sendQuickMessage() {
    const message = "Привет! У меня вопрос по отчету эффективность.рф";
    const telegramUrl = `https://t.me/KlimovOE?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    showNotification('Открываю Telegram с готовым сообщением...');
}

function showNotification(message) {
    const existingNotification = document.querySelector('.feedback-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'feedback-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-secondary);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10002;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}