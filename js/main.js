(() => {
    'use strict';

    const THEME_KEY = 'theme';
    const LANG_KEY = 'lang';
    const DEFAULT_LANG = 'ru';
    const I18N_ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'content'];
    const REVEAL_SELECTOR =
        '.feature, .service, .about__inner, .gallery__item, .review, .booking__inner, .contacts__inner';

    const { uk: UK = {}, ui: UI = {} } = window.BeautyI18n || {};
    const root = document.documentElement;
    const $ = id => document.getElementById(id);

    const storage = {
        get(key) {
            try { return localStorage.getItem(key); } catch { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, value); } catch { /* приватный режим */ }
        }
    };

    /* ---------- Язык ---------- */

    let lang = DEFAULT_LANG;
    const langListeners = [];

    // Строки, которые подставляет скрипт (подписи кнопок)
    const t = key => (UI[lang] || UI[DEFAULT_LANG] || {})[key] || '';
    // Блоки с динамическими подписями обновляют их при смене языка
    const onLangChange = fn => langListeners.push(fn);

    function detectLang() {
        const stored = storage.get(LANG_KEY);
        if (stored === 'ru' || stored === 'uk') return stored;
        const preferred = navigator.languages || [navigator.language || ''];
        return preferred.some(code => code.toLowerCase().startsWith('uk')) ? 'uk' : DEFAULT_LANG;
    }

    function initLang() {
        // Русский берём из разметки один раз, чтобы можно было вернуться обратно
        const texts = [...document.querySelectorAll('[data-i18n]')].map(el => ({
            el, key: el.dataset.i18n, source: el.innerHTML
        }));
        const attrs = I18N_ATTRS.flatMap(attr =>
            [...document.querySelectorAll(`[data-i18n-${attr}]`)].map(el => ({
                el, attr, key: el.getAttribute(`data-i18n-${attr}`), source: el.getAttribute(attr)
            }))
        );

        const translate = ({ key, source }) => (lang === 'uk' && key in UK ? UK[key] : source);

        const apply = next => {
            lang = next;
            root.lang = lang;
            texts.forEach(item => { item.el.innerHTML = translate(item); });
            attrs.forEach(item => { item.el.setAttribute(item.attr, translate(item)); });
            langListeners.forEach(fn => fn());
        };

        $('langToggle').addEventListener('click', () => {
            const next = lang === 'uk' ? 'ru' : 'uk';
            apply(next);
            storage.set(LANG_KEY, next);
        });

        const initial = detectLang();
        if (initial !== DEFAULT_LANG) apply(initial);
    }

    /* ---------- Тема ---------- */

    // Начальное значение ставит инлайн-скрипт в <head>, здесь только переключение
    function initTheme() {
        const toggle = $('themeToggle');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

        const updateLabel = () => toggle.setAttribute(
            'aria-label',
            t(root.dataset.theme === 'dark' ? 'themeToLight' : 'themeToDark')
        );
        const apply = theme => {
            root.dataset.theme = theme;
            updateLabel();
        };

        apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
        onLangChange(updateLabel);

        toggle.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            apply(next);
            storage.set(THEME_KEY, next);
        });

        // Пока пользователь не выбрал тему сам, следуем за системной
        systemDark.addEventListener('change', e => {
            if (!storage.get(THEME_KEY)) apply(e.matches ? 'dark' : 'light');
        });
    }

    /* ---------- Интерфейс ---------- */

    function initMenu() {
        const burger = $('burger');
        const nav = $('nav');
        const isOpen = () => nav.classList.contains('is-open');

        const updateLabel = () => burger.setAttribute('aria-label', t(isOpen() ? 'menuClose' : 'menuOpen'));
        const setOpen = open => {
            burger.classList.toggle('is-open', open);
            nav.classList.toggle('is-open', open);
            burger.setAttribute('aria-expanded', String(open));
            updateLabel();
        };

        onLangChange(updateLabel);
        burger.addEventListener('click', () => setOpen(!isOpen()));
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
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    // Подписчики на смену языка регистрируются до первого применения перевода
    initTheme();
    initMenu();
    initLang();
    initHeaderShadow();
    initLightbox();
    initBookingForm();
    initReveal();
})();
