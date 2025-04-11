// script.js

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

let index = 0;
const slides = document.querySelector('.carousel-images');
const dots = document.querySelectorAll('.dot');
const total = slides.children.length;

function showSlide(i) {
    slides.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[i].classList.add('active');
}

setInterval(() => {
    index = (index + 1) % total;
    showSlide(index);
}, 4000);
