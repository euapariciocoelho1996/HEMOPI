/**
 * Main JavaScript functionality for Sangue Solidário
 * Handles animations and carousel on home page
 */

// Animation on scroll functionality
class ScrollAnimation {
    constructor(selector, threshold = 0.1) {
        this.elements = document.querySelectorAll(selector);
        this.threshold = threshold;
        this.setupObserver();
        this.initialize();
    }

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.threshold
        });
    }

    initialize() {
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

// Carousel functionality
class Carousel {
    constructor(containerSelector = '.carousel', dotsSelector = '.dot', interval = 4000) {
        this.slides = document.querySelector(`${containerSelector}-images`);
        this.dots = document.querySelectorAll(dotsSelector);
        this.index = 0;
        this.total = this.slides ? this.slides.children.length : 0;
        this.interval = interval;
        
        if (this.slides && this.total > 0) {
            this.start();
        }
    }

    showSlide(i) {
        if (!this.slides) return;
        
        this.slides.style.transform = `translateX(-${i * 100}%)`;
        this.dots.forEach(dot => dot.classList.remove('active'));
        if (this.dots[i]) {
            this.dots[i].classList.add('active');
        }
    }

    next() {
        this.index = (this.index + 1) % this.total;
        this.showSlide(this.index);
    }

    start() {
        setInterval(() => this.next(), this.interval);
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    // Start animations when elements scroll into view
    new ScrollAnimation('.reveal');
    
    // Start image carousel
    new Carousel('.carousel', '.dot', 4000);
});
