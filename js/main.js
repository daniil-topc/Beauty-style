(() => {
    'use strict';

    const THEME_KEY = 'theme';
    const REVEAL_SELECTOR =
        '.feature, .service, .about__inner, .gallery__item, .review, .booking__inner, .contacts__inner';

    const $ = id => document.getElementById(id);

    /* Тема: начальное значение ставит инлайн-скрипт в <head>, здесь только переключение */
    function initTheme() {
        const root = document.documentElement;
        const toggle = $('themeToggle');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

        const readStored = () => {
            try { return localStorage.getItem(THEME_KEY); } catch { return null; }
        };

        const apply = theme => {
            root.dataset.theme = theme;
            toggle.setAttribute(
                'aria-label',
                theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
            );
        };

        apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

        toggle.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            apply(next);
            try { localStorage.setItem(THEME_KEY, next); } catch { /* приватный режим */ }
        });

        // Пока пользователь не выбрал тему сам, следуем за системной
        systemDark.addEventListener('change', e => {
            if (!readStored()) apply(e.matches ? 'dark' : 'light');
        });
    }

    function initMenu() {
        const burger = $('burger');
        const nav = $('nav');

        const setOpen = open => {
            burger.classList.toggle('is-open', open);
            nav.classList.toggle('is-open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        };

        burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
        nav.addEventListener('click', e => {
            if (e.target.closest('a')) setOpen(false);
        });
    }

    function initHeaderShadow() {
        const header = $('header');
        const update = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initLightbox() {
        const lightbox = $('lightbox');
        const image = lightbox.querySelector('img');

        const setOpen = open => {
            lightbox.classList.toggle('is-open', open);
            lightbox.setAttribute('aria-hidden', String(!open));
        };

        document.querySelector('.gallery').addEventListener('click', e => {
            const item = e.target.closest('.gallery__item');
            if (!item) return;
            e.preventDefault();
            image.src = item.href;
            image.alt = item.querySelector('img').alt;
            setOpen(true);
        });

        lightbox.addEventListener('click', e => {
            if (e.target !== image) setOpen(false);
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setOpen(false);
        });
    }

    function initBookingForm() {
        const form = $('bookingForm');

        // Нельзя записаться на прошедшую дату
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        form.elements.date.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        form.addEventListener('submit', e => {
            e.preventDefault();
            form.classList.add('is-sent');
        });
    }

    function initReveal() {
        const targets = document.querySelectorAll(REVEAL_SELECTOR);
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        targets.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    initTheme();
    initMenu();
    initHeaderShadow();
    initLightbox();
    initBookingForm();
    initReveal();
})();
