// main.js - оптимизированная версия
document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Эффект хедера при скролле
    const header = document.querySelector('.main-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Скрыть/показать хедер при скролле
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = window.scrollY;
    });

    // Анимация появления элементов
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Наблюдение за элементами для анимации
    document.querySelectorAll('.feature-card, .step-item, .info-card').forEach(el => {
        observer.observe(el);
    });

    // Инициализация Telegram фидбэка
    initializeTelegramFeedback();
});

// Telegram фидбэк
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
        group: 'https://t.me/+1234567890' // Замените на реальную ссылку
    };

    const url = telegramUrls[type];
    if (url) {
        window.open(url, '_blank');
        
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'feedback-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-secondary);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10002;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        font-size: 14px;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    .feature-card,
    .step-item,
    .info-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }

    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);