const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
});

nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
}));

const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll);
onScroll();

const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
const closeLb = () => lb.classList.remove('is-open');

document.querySelectorAll('.gallery__item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        lbImg.src = item.href;
        lbImg.alt = item.querySelector('img').alt;
        lb.classList.add('is-open');
    });
});

lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

document.getElementById('bookingForm').addEventListener('submit', e => {
    e.preventDefault();
    e.target.classList.add('is-sent');
});

const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
    }
}), { threshold: 0.12 });

document
    .querySelectorAll('.feature, .service, .about__inner, .gallery__item, .review, .booking__inner, .contacts__inner')
    .forEach(el => {
        el.classList.add('reveal');
        io.observe(el);
    });
