/* ========================================
   Confetti JavaScript
======================================== */

class ConfettiGenerator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            particleCount: options.particleCount || 100,
            colors: options.colors || ['#8b5cf6', '#ffd700', '#a855f7', '#87ceeb', '#98fb98', '#7c3aed', '#c4b5fd'],
            shapes: options.shapes || ['square', 'circle', 'triangle'],
            duration: options.duration || 3000,
            spread: options.spread || 50
        };
        this.particles = [];
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        const shape = this.options.shapes[Math.floor(Math.random() * this.options.shapes.length)];
        const size = Math.random() * 10 + 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            top: -20px;
            opacity: 1;
            pointer-events: none;
        `;

        switch (shape) {
            case 'circle':
                particle.style.borderRadius = '50%';
                break;
            case 'triangle':
                particle.style.width = '0';
                particle.style.height = '0';
                particle.style.background = 'transparent';
                particle.style.borderLeft = `${size/2}px solid transparent`;
                particle.style.borderRight = `${size/2}px solid transparent`;
                particle.style.borderBottom = `${size}px solid ${color}`;
                break;
            default:
                particle.style.borderRadius = '2px';
        }

        return particle;
    }

    animateParticle(particle) {
        const duration = this.options.duration + Math.random() * 2000;
        const horizontalMovement = (Math.random() - 0.5) * this.options.spread * 2;
        const rotation = Math.random() * 720 - 360;

        particle.animate([
            {
                transform: 'translateY(0) translateX(0) rotate(0deg)',
                opacity: 1
            },
            {
                transform: `translateY(${window.innerHeight + 100}px) translateX(${horizontalMovement}px) rotate(${rotation}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            particle.remove();
        };
    }

    start() {
        for (let i = 0; i < this.options.particleCount; i++) {
            setTimeout(() => {
                const particle = this.createParticle();
                this.container.appendChild(particle);
                this.animateParticle(particle);
            }, Math.random() * 2000);
        }
    }

    burst(x, y) {
        for (let i = 0; i < 50; i++) {
            const particle = this.createParticle();
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            this.container.appendChild(particle);

            const angle = (Math.PI * 2 * i) / 50;
            const velocity = Math.random() * 200 + 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${vx}px, ${vy}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    continuous(duration = 10000) {
        const interval = setInterval(() => {
            const particle = this.createParticle();
            this.container.appendChild(particle);
            this.animateParticle(particle);
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
        }, duration);
    }
}

// Create falling hearts animation
class HeartRain {
    constructor(container) {
        this.container = container;
        this.hearts = ['💖', '💕', '💗', '💝', '💘', '❤️', '💜', '💛'];
    }

    createHeart() {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.textContent = this.hearts[Math.floor(Math.random() * this.hearts.length)];
        heart.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -50px;
            font-size: ${Math.random() * 20 + 15}px;
            opacity: ${Math.random() * 0.5 + 0.5};
            pointer-events: none;
        `;
        return heart;
    }

    start(duration = 5000) {
        const interval = setInterval(() => {
            const heart = this.createHeart();
            this.container.appendChild(heart);
            
            const fallDuration = Math.random() * 3000 + 2000;
            heart.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: fallDuration,
                easing: 'ease-in'
            }).onfinish = () => heart.remove();
        }, 100);

        setTimeout(() => clearInterval(interval), duration);
    }
}

// Create balloon rise animation
class BalloonRise {
    constructor(container) {
        this.container = container;
        this.colors = ['🎈', '🎈', '🎈', '🎈'];
    }

    createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'rising-balloon';
        balloon.textContent = this.colors[Math.floor(Math.random() * this.colors.length)];
        balloon.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            bottom: -100px;
            font-size: ${Math.random() * 30 + 40}px;
            pointer-events: none;
            filter: hue-rotate(${Math.random() * 360}deg);
        `;
        return balloon;
    }

    start(count = 20) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const balloon = this.createBalloon();
                this.container.appendChild(balloon);
                
                balloon.animate([
                    { transform: 'translateY(0) rotate(-5deg)', opacity: 0 },
                    { transform: 'translateY(-20px) rotate(5deg)', opacity: 1, offset: 0.1 },
                    { transform: `translateY(-${window.innerHeight + 200}px) rotate(${Math.random() * 20 - 10}deg)`, opacity: 1 }
                ], {
                    duration: Math.random() * 5000 + 5000,
                    easing: 'ease-out'
                }).onfinish = () => balloon.remove();
            }, i * 200);
        }
    }
}

// Star burst effect
class StarBurst {
    constructor(container) {
        this.container = container;
        this.stars = ['⭐', '✨', '🌟', '💫'];
    }

    burst(x, y) {
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.textContent = this.stars[Math.floor(Math.random() * this.stars.length)];
            star.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                font-size: ${Math.random() * 15 + 10}px;
                pointer-events: none;
            `;
            this.container.appendChild(star);

            const angle = (Math.PI * 2 * i) / 20;
            const distance = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            star.animate([
                { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 1, offset: 0.5 },
                { transform: `translate(${tx * 1.5}px, ${ty * 1.5}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => star.remove();
        }
    }
}

// Export for use in other files
window.ConfettiGenerator = ConfettiGenerator;
window.HeartRain = HeartRain;
window.BalloonRise = BalloonRise;
window.StarBurst = StarBurst;
