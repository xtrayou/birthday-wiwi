/* ========================================
   Gallery JavaScript
======================================== */

class MemoryGallery {
    constructor() {
        this.currentView = 'grid';
        this.currentSlide = 0;
        this.isPlaying = false;
        this.slideshowInterval = null;
        
        this.memories = [
            { src: 'images/wiwi.png', caption: 'Widda Aulia Ditasari 💜', year: '2025' },
            { src: 'images/wiwi (1).jpeg', caption: 'Cantik Selalu ✨', year: '2021' },
            { src: 'images/wiwi (2).jpeg', caption: 'Senyum Manis 😊', year: '2021' },
            { src: 'images/wiwi (3).jpeg', caption: 'Momen Bahagia 🌟', year: '2022' },
            { src: 'images/wiwi (4).jpeg', caption: 'Kenangan Indah 💫', year: '2022' },
            { src: 'images/wiwi (5).jpeg', caption: 'Best Moment 🎉', year: '2022' },
            { src: 'images/wiwi (6).jpeg', caption: 'Sahabat Terbaik 💜', year: '2023' },
            { src: 'images/wiwi (7).jpeg', caption: 'Sweet Memory 🌸', year: '2023' },
            { src: 'images/wiwi (8).jpeg', caption: 'Tawa Bersama 😄', year: '2023' },
            { src: 'images/wiwi (9).jpeg', caption: 'Forever Friends 💕', year: '2024' },
            { src: 'images/wiwi (10).jpeg', caption: 'Happy Vibes ✨', year: '2024' },
            { src: 'images/wiwi (11).jpeg', caption: 'Precious Time 🌈', year: '2024' },
            { src: 'images/wiwi (12).jpeg', caption: 'Beautiful Soul 💜', year: '2024' },
            { src: 'images/wiwi (13).jpeg', caption: 'Persahabatan Abadi 🌟', year: '2025' }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.initSlideshow();
    }

    bindEvents() {
        // Gallery tabs
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Memory items click (for lightbox)
        document.querySelectorAll('.memory-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openLightbox(index);
            });
        });

        // Lightbox close
        const lightboxClose = document.getElementById('lightboxClose');
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        // Close lightbox on background click
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox').classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeLightbox();
                } else if (e.key === 'ArrowLeft') {
                    this.lightboxPrev();
                } else if (e.key === 'ArrowRight') {
                    this.lightboxNext();
                }
            }
        });

        // Slideshow controls
        const slidePrev = document.getElementById('slidePrev');
        const slideNext = document.getElementById('slideNext');
        const playPause = document.getElementById('slideshowPlayPause');

        if (slidePrev) {
            slidePrev.addEventListener('click', () => this.prevSlide());
        }
        if (slideNext) {
            slideNext.addEventListener('click', () => this.nextSlide());
        }
        if (playPause) {
            playPause.addEventListener('click', () => this.togglePlayPause());
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update tabs
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.gallery-view').forEach(v => {
            v.classList.remove('active');
        });

        const viewElement = document.getElementById(`${view}View`);
        if (viewElement) {
            viewElement.classList.add('active');
        }

        // Stop slideshow if switching away
        if (view !== 'slideshow') {
            this.stopSlideshow();
        }
    }

    initSlideshow() {
        this.renderDots();
        this.updateSlide();
    }

    renderDots() {
        const dotsContainer = document.getElementById('slideshowDots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = this.memories.map((_, index) => `
            <div class="slideshow-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('');

        // Bind dot clicks
        dotsContainer.querySelectorAll('.slideshow-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                this.goToSlide(parseInt(e.target.dataset.index));
            });
        });
    }

    updateSlide() {
        const image = document.getElementById('slideshowImage');
        const caption = document.getElementById('slideshowCaption');
        const dots = document.querySelectorAll('.slideshow-dot');

        if (!image || !caption) return;

        const memory = this.memories[this.currentSlide];
        
        // Try to load actual image, fallback to placeholder
        image.onerror = () => {
            image.src = memory.fallback;
        };
        image.src = memory.src;
        caption.textContent = memory.caption;

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.memories.length;
        this.updateSlide();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.memories.length) % this.memories.length;
        this.updateSlide();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlide();
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.stopSlideshow();
        } else {
            this.startSlideshow();
        }
    }

    startSlideshow() {
        this.isPlaying = true;
        const playPauseBtn = document.getElementById('slideshowPlayPause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }

        this.slideshowInterval = setInterval(() => {
            this.nextSlide();
        }, 3000);
    }

    stopSlideshow() {
        this.isPlaying = false;
        const playPauseBtn = document.getElementById('slideshowPlayPause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }

        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }

    // Lightbox functions
    currentLightboxIndex = 0;

    openLightbox(index) {
        this.currentLightboxIndex = index;
        const lightbox = document.getElementById('lightbox');
        const image = document.getElementById('lightboxImage');
        const caption = document.getElementById('lightboxCaption');

        if (!lightbox || !image || !caption) return;

        const memory = this.memories[index];
        
        image.onerror = () => {
            image.src = memory.fallback;
        };
        image.src = memory.src;
        caption.textContent = memory.caption;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    lightboxPrev() {
        this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.memories.length) % this.memories.length;
        this.updateLightboxImage();
    }

    lightboxNext() {
        this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.memories.length;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const image = document.getElementById('lightboxImage');
        const caption = document.getElementById('lightboxCaption');

        if (!image || !caption) return;

        const memory = this.memories[this.currentLightboxIndex];
        
        image.onerror = () => {
            image.src = memory.fallback;
        };
        image.src = memory.src;
        caption.textContent = memory.caption;
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.memoryGallery = new MemoryGallery();
});
