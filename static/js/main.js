// Mobile menu toggle и основная логика
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
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

    // Инициализация Telegram обратной связи - ВНУТРИ одного DOMContentLoaded
    initializeTelegramFeedback();
});

// Добавляем стили для анимаций ОДИН РАЗ
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

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: var(--white);
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: var(--shadow);
            padding: 2rem 0;
        }

        .nav-menu.active {
            left: 0;
        }
    }

    /* Стили для уведомлений Telegram */
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

// Telegram обратная связь - ВНЕ DOMContentLoaded
function initializeTelegramFeedback() {
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const modalClose = document.getElementById('modalClose');
    const telegramOptions = document.querySelectorAll('.telegram-option');

    console.log('Initializing Telegram feedback...');
    console.log('Feedback button:', feedbackBtn);
    console.log('Feedback modal:', feedbackModal);
    console.log('Modal close:', modalClose);
    console.log('Telegram options:', telegramOptions.length);

    // Открытие модального окна
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Feedback button clicked');
            if (feedbackModal) {
                feedbackModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                console.error('Modal not found when button clicked');
            }
        });
    } else {
        console.error('Feedback button not found');
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
            console.log('Telegram option clicked:', type);
            openTelegram(type);
        });
    });
}

// Функции для открытия Telegram
function openTelegram(type) {
    console.log('Opening Telegram:', type);

    // ЗАМЕНИ эти ссылки на свои!
    const telegramUrls = {
        direct: 'https://t.me/KlimovOE' // Твой Telegram username
    };

    const url = telegramUrls[type];
    if (url) {
        // Открываем Telegram в новой вкладке
        window.open(url, '_blank', 'noopener,noreferrer');

        // Показываем уведомление
        showNotification(type === 'direct'
            ? 'Открываю Telegram...'
            : 'Открываю группу поддержки...');

        // Закрываем модальное окно
        const feedbackModal = document.getElementById('feedbackModal');
        if (feedbackModal) {
            feedbackModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    } else {
        console.error('Invalid Telegram type:', type);
    }
}

// Функция для быстрого сообщения (для баннера)
function sendQuickMessage() {
    const message = "Привет! У меня вопрос по отчету эффективность.рф";
    // ЗАМЕНИ на свой username
    const telegramUrl = `https://t.me/KlimovOE?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    showNotification('Открываю Telegram с готовым сообщением...');
}

// Вспомогательная функция для уведомлений
function showNotification(message) {
    // Удаляем существующие уведомления
    const existingNotification = document.querySelector('.feedback-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'feedback-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
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