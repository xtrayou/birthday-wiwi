/* ========================================
   Main JavaScript
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader immediately and show popup
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
    
    // Initialize popup
    initWelcomePopup();
});

function initAllComponents() {
    initNavigation();
    initMusic();
    initCountdown();
    initLetter();
    initPlaylist();
    initSurprise();
    initGuestbook();
    initClosing();
    initScrollAnimations();
    initConfetti();
}

/* ========================================
   Welcome Popup Banner Slider
======================================== */
function initWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    const closeBtn = document.getElementById('popupClose');
    const enterBtn = document.getElementById('enterSiteBtn');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const progressBar = document.getElementById('progressBar');
    
    if (!popup) {
        initAllComponents();
        return;
    }
    
    let currentSlide = 0;
    let slideInterval;
    let progressInterval;
    const slideDuration = 3000; // 3 seconds per slide (faster)
    const progressStep = 100 / (slideDuration / 100); // Update every 100ms (less frequent)
    let progress = 0;
    
    // Auto slide function
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (currentSlide + 1) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        progress = 0;
        progressBar.style.width = '0%';
    }
    
    // Progress bar animation
    function updateProgress() {
        progress += progressStep;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            nextSlide();
        }
    }
    
    // Start auto sliding
    function startSlider() {
        progressInterval = setInterval(updateProgress, 100);
    }
    
    // Stop slider
    function stopSlider() {
        clearInterval(slideInterval);
        clearInterval(progressInterval);
    }
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index !== currentSlide) {
                slides[currentSlide].classList.remove('active');
                dots[currentSlide].classList.remove('active');
                
                currentSlide = index;
                
                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
                
                progress = 0;
                progressBar.style.width = '0%';
            }
        });
    });
    
    // Close popup function
    function closePopup() {
        stopSlider();
        popup.classList.add('hidden');
        
        // Initialize other components after popup closes
        setTimeout(() => {
            initAllComponents();
        }, 300);
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closePopup);
    enterBtn.addEventListener('click', closePopup);
    
    // Start the slider
    startSlider();
}

/* ========================================
   Preloader
======================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    // Hide preloader immediately
    const hidePreloader = () => {
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            startOpeningAnimations();
        }
    };
    
    // Hide immediately since popup already showed
    hidePreloader();
}

function startOpeningAnimations() {
    // Start confetti
    const confettiContainer = document.getElementById('confettiContainer');
    if (confettiContainer && window.ConfettiGenerator) {
        const confetti = new ConfettiGenerator(confettiContainer, {
            particleCount: 150,
            duration: 4000
        });
        confetti.start();
    }
}

/* ========================================
   Navigation
======================================== */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Update active link based on scroll position
        updateActiveNavLink();
    });

    // Mobile toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scroll for nav links
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                navLinks.classList.remove('active');
            }
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

/* ========================================
   Background Music
======================================== */
function initMusic() {
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = true; // Start as playing

    if (musicBtn && bgMusic) {
        // Try to autoplay music when page loads
        bgMusic.volume = 0.5; // Set volume to 50%
        
        const playMusic = () => {
            bgMusic.play().then(() => {
                isPlaying = true;
                musicBtn.classList.add('playing');
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(e => {
                console.log('Autoplay blocked, waiting for user interaction');
                isPlaying = false;
                musicBtn.classList.remove('playing');
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            });
        };
        
        // Try to play immediately
        playMusic();
        
        // Also try on first user interaction (for browsers that block autoplay)
        const startOnInteraction = () => {
            if (!isPlaying) {
                playMusic();
            }
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
            document.removeEventListener('scroll', startOnInteraction);
        };
        
        document.addEventListener('click', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
        document.addEventListener('scroll', startOnInteraction);
        
        // Toggle button
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                isPlaying = false;
            } else {
                bgMusic.play().catch(err => console.log('Play failed:', err));
                musicBtn.classList.add('playing');
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                isPlaying = true;
            }
        });
    }
}

/* ========================================
   Countdown
======================================== */
function initCountdown() {
    // Birthday: January 1, 2025
    const birthdayDate = new Date('2025-01-01T00:00:00');
    
    if (window.BirthdayCountdown) {
        const countdown = new BirthdayCountdown(birthdayDate, {
            onComplete: () => {
                // Trigger celebration
                celebrateBirthday();
            }
        });
        countdown.start();
    }

    // Start button scroll
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('countdown').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function celebrateBirthday() {
    // Show fireworks
    const confettiContainer = document.getElementById('confettiContainer');
    if (confettiContainer && window.ConfettiGenerator) {
        const confetti = new ConfettiGenerator(confettiContainer, {
            particleCount: 200
        });
        confetti.continuous(10000);
    }

    // Show balloon rise
    if (window.BalloonRise) {
        const balloons = new BalloonRise(document.body);
        balloons.start(30);
    }
}

/* ========================================
   Letter Section
======================================== */
function initLetter() {
    const envelope = document.getElementById('envelope');
    const letterPaper = document.getElementById('letterPaper');

    if (envelope && letterPaper) {
        envelope.addEventListener('click', () => {
            envelope.classList.add('opened');
            letterPaper.classList.add('visible');
            
            // Animate paragraphs
            const paragraphs = letterPaper.querySelectorAll('.letter-paragraph');
            paragraphs.forEach((p, index) => {
                setTimeout(() => {
                    p.classList.add('visible');
                }, (index + 1) * 800);
            });
        });
    }
}

/* ========================================
   Playlist Section
======================================== */
function initPlaylist() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    const currentSong = document.getElementById('currentSong');
    const currentArtist = document.getElementById('currentArtist');
    const vinyl = document.querySelector('.vinyl');

    playlistItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            playlistItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update now playing
            if (currentSong && currentArtist) {
                currentSong.textContent = item.dataset.song;
                currentArtist.textContent = item.dataset.artist;
            }

            // Spin vinyl
            if (vinyl) {
                vinyl.style.animationPlayState = 'running';
            }
        });
    });
}

/* ========================================
   Surprise Section
======================================== */
function initSurprise() {
    // Gift box
    const giftBox = document.getElementById('giftBox');
    const giftContent = document.getElementById('giftContent');

    if (giftBox && giftContent) {
        giftBox.addEventListener('click', () => {
            giftBox.classList.add('opened');
            giftContent.style.display = 'block';
            
            // Confetti burst
            if (window.ConfettiGenerator) {
                const confetti = new ConfettiGenerator(document.body);
                const rect = giftBox.getBoundingClientRect();
                confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        });
    }

    // Secret button
    const secretBtn = document.getElementById('secretBtn');
    const secretReveal = document.getElementById('secretReveal');

    if (secretBtn && secretReveal) {
        secretBtn.addEventListener('click', () => {
            secretReveal.style.display = 'block';
            secretBtn.disabled = true;
            secretBtn.innerHTML = '<i class="fas fa-check"></i> Terima kasih sudah senyum!';
            
            // Heart rain
            if (window.HeartRain) {
                const hearts = new HeartRain(document.body);
                hearts.start(3000);
            }
        });
    }

    // Generate wish cards
    generateWishCards();
}

function generateWishCards() {
    const wishCardsContainer = document.getElementById('wishCards');
    if (!wishCardsContainer) return;

    const wishes = [
        'Sehat selalu',
        'Sukses karir',
        'Persahabatan abadi',
        'Bahagia tiada akhir',
        'Impian terwujud',
        'Rezeki melimpah',
        'Keluarga harmonis',
        'Teman sejati',
        'Perjalanan seru',
        'Kreativitas tinggi',
        'Hidup penuh makna',
        'Dicintai banyak orang',
        'Pikiran tenang',
        'Hati yang damai',
        'Semangat membara',
        'Kepercayaan diri',
        'Kebijaksanaan',
        'Keberuntungan',
        'Kasih sayang sahabat',
        'Keajaiban hidup',
        'Mimpi indah',
        'Umur panjang'
    ];

    wishCardsContainer.innerHTML = wishes.map((wish, index) => `
        <div class="wish-card" data-index="${index}">
            <span class="card-front">${index + 1}</span>
            <span class="card-back" style="display: none;">${wish}</span>
        </div>
    `).join('');

    // Bind click events
    wishCardsContainer.querySelectorAll('.wish-card').forEach(card => {
        card.addEventListener('click', () => {
            const front = card.querySelector('.card-front');
            const back = card.querySelector('.card-back');
            
            if (!card.classList.contains('revealed')) {
                card.classList.add('revealed');
                front.style.display = 'none';
                back.style.display = 'block';
                
                // Star burst effect
                if (window.StarBurst) {
                    const starBurst = new StarBurst(document.body);
                    const rect = card.getBoundingClientRect();
                    starBurst.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
            }
        });
    });
}

/* ========================================
   Guestbook Section
======================================== */
function initGuestbook() {
    const form = document.getElementById('guestbookForm');
    const messagesList = document.getElementById('messagesList');
    let selectedEmoji = '🎂';

    // Emoji picker
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = btn.dataset.emoji;
        });
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('guestName').value;
            const message = document.getElementById('guestMessage').value;
            const date = new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });

            // Create message card
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            messageCard.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${selectedEmoji} ${name}</span>
                    <span class="message-date">${date}</span>
                </div>
                <p class="message-content">${message}</p>
            `;

            // Add to list (after sample message)
            if (messagesList) {
                const sampleMessage = messagesList.querySelector('.sample');
                if (sampleMessage) {
                    messagesList.insertBefore(messageCard, sampleMessage.nextSibling);
                } else {
                    messagesList.prepend(messageCard);
                }
            }

            // Save to localStorage
            saveMessage({ name, message, emoji: selectedEmoji, date });

            // Reset form
            form.reset();
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            document.querySelector('.emoji-btn').classList.add('selected');
            selectedEmoji = '🎂';

            // Show success
            alert('Pesan berhasil dikirim! Terima kasih! 💖');
        });
    }

    // Load saved messages
    loadMessages();
}

function saveMessage(message) {
    let messages = JSON.parse(localStorage.getItem('guestbookMessages') || '[]');
    messages.unshift(message);
    messages = messages.slice(0, 50); // Keep last 50 messages
    localStorage.setItem('guestbookMessages', JSON.stringify(messages));
}

function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    const messages = JSON.parse(localStorage.getItem('guestbookMessages') || '[]');
    
    messages.forEach(msg => {
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card';
        messageCard.innerHTML = `
            <div class="message-header">
                <span class="message-author">${msg.emoji} ${msg.name}</span>
                <span class="message-date">${msg.date}</span>
            </div>
            <p class="message-content">${msg.message}</p>
        `;
        messagesList.appendChild(messageCard);
    });
}

/* ========================================
   Closing Section
======================================== */
function initClosing() {
    const replayBtn = document.getElementById('replayBtn');
    const loveBtn = document.getElementById('loveBtn');
    const finalConfetti = document.getElementById('finalConfetti');

    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (loveBtn) {
        loveBtn.addEventListener('click', () => {
            // Star explosion untuk sahabat
            if (window.StarBurst) {
                const starBurst = new StarBurst(document.body);
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        starBurst.burst(
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerHeight
                        );
                    }, i * 200);
                }
            }

            // Change button text
            loveBtn.innerHTML = '<i class="fas fa-user-friends"></i> Friends Forever! 💜';
            loveBtn.classList.add('animate-heartbeat');
        });
    }

    // Trigger confetti when reaching closing section
    const closingSection = document.getElementById('closing');
    if (closingSection && finalConfetti) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (window.ConfettiGenerator) {
                        const confetti = new ConfettiGenerator(finalConfetti, {
                            particleCount: 100
                        });
                        confetti.start();
                    }
                    observer.unobserve(closingSection);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(closingSection);
    }
}

/* ========================================
   Scroll Animations
======================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });

    // Add reveal class to section headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.classList.add('reveal');
        observer.observe(header);
    });
}

/* ========================================
   Confetti Effect
======================================== */
function initConfetti() {
    // Create random confetti on click anywhere
    document.addEventListener('click', (e) => {
        // Only trigger on specific elements or randomly
        if (e.target.tagName === 'BUTTON' || Math.random() > 0.8) {
            if (window.StarBurst) {
                const starBurst = new StarBurst(document.body);
                starBurst.burst(e.clientX, e.clientY);
            }
        }
    });
}

/* ========================================
   Utility Functions
======================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Console birthday message
console.log(`
%c🎂 Happy 22nd Birthday Widda Aulia Ditasari! 🎂
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%c✨ Untuk sahabat terbaikku! ✨
%c💜 1 Januari 2025 💜
`, 
'color: #8b5cf6; font-size: 24px; font-weight: bold;',
'color: #a855f7;',
'color: #c084fc; font-size: 16px;',
'color: #8b5cf6; font-size: 14px;'
);
