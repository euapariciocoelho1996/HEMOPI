/**
 * Main JavaScript functionality for Sangue Solidário
 * Handles animations and carousel on home page
 */

/**
 * ScrollAnimation Class
 * Adds animation effects when elements scroll into view
 */
class ScrollAnimation {
    /**
     * Creates a new scroll animation instance
     * @param {string} selector - CSS selector for elements to animate
     * @param {number} threshold - Intersection threshold (0-1)
     */
    constructor(selector, threshold = 0.1) {
        this.elements = document.querySelectorAll(selector);
        this.threshold = threshold;
        this.setupObserver();
        this.initialize();
    }

    /**
     * Sets up the Intersection Observer
     */
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

    /**
     * Initializes observation of all target elements
     */
    initialize() {
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

/**
 * Carousel Class
 * Creates and manages an image carousel
 */
class Carousel {
    /**
     * Creates a new carousel instance
     * @param {string} containerSelector - CSS selector for carousel container
     * @param {string} dotsSelector - CSS selector for carousel indicator dots
     * @param {number} interval - Time in ms between slide transitions
     */
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

    /**
     * Shows a specific slide
     * @param {number} i - Slide index to show
     */
    showSlide(i) {
        if (!this.slides) return;
        
        this.slides.style.transform = `translateX(-${i * 100}%)`;
        this.dots.forEach(dot => dot.classList.remove('active'));
        if (this.dots[i]) {
            this.dots[i].classList.add('active');
        }
    }

    /**
     * Advances to the next slide
     */
    next() {
        this.index = (this.index + 1) % this.total;
        this.showSlide(this.index);
    }

    /**
     * Starts the automatic carousel rotation
     */
    start() {
        setInterval(() => this.next(), this.interval);
    }
}

/**
 * Initialize page features when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Start animations when elements scroll into view
    new ScrollAnimation('.reveal');
    
    // Start image carousel
    new Carousel('.carousel', '.dot', 4000);
});
