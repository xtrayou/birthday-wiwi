/* ========================================
   Countdown JavaScript
======================================== */

class BirthdayCountdown {
    constructor(targetDate, options = {}) {
        this.targetDate = new Date(targetDate);
        this.options = {
            daysElement: options.daysElement || document.getElementById('days'),
            hoursElement: options.hoursElement || document.getElementById('hours'),
            minutesElement: options.minutesElement || document.getElementById('minutes'),
            secondsElement: options.secondsElement || document.getElementById('seconds'),
            onComplete: options.onComplete || null,
            countdownContainer: options.countdownContainer || document.querySelector('.countdown-container'),
            birthdayReachedElement: options.birthdayReachedElement || document.getElementById('birthdayReached')
        };
        this.interval = null;
        this.hasCompleted = false;
    }

    calculateTimeLeft() {
        const now = new Date();
        const difference = this.targetDate - now;

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                total: 0
            };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            total: difference
        };
    }

    formatNumber(num) {
        return num.toString().padStart(2, '0');
    }

    updateDisplay(timeLeft) {
        if (this.options.daysElement) {
            this.animateNumber(this.options.daysElement, this.formatNumber(timeLeft.days));
        }
        if (this.options.hoursElement) {
            this.animateNumber(this.options.hoursElement, this.formatNumber(timeLeft.hours));
        }
        if (this.options.minutesElement) {
            this.animateNumber(this.options.minutesElement, this.formatNumber(timeLeft.minutes));
        }
        if (this.options.secondsElement) {
            this.animateNumber(this.options.secondsElement, this.formatNumber(timeLeft.seconds));
        }
    }

    animateNumber(element, newValue) {
        if (element.textContent !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.textContent = newValue;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 100);
        }
    }

    showBirthdayReached() {
        if (this.options.countdownContainer) {
            this.options.countdownContainer.style.display = 'none';
        }
        if (this.options.birthdayReachedElement) {
            this.options.birthdayReachedElement.style.display = 'block';
            this.options.birthdayReachedElement.classList.add('animate-bounceIn');
        }
    }

    start() {
        // Initial update
        const timeLeft = this.calculateTimeLeft();
        this.updateDisplay(timeLeft);

        // Check if birthday has already passed
        if (timeLeft.total <= 0 && !this.hasCompleted) {
            this.hasCompleted = true;
            this.showBirthdayReached();
            if (this.options.onComplete) {
                this.options.onComplete();
            }
            return;
        }

        // Update every second
        this.interval = setInterval(() => {
            const timeLeft = this.calculateTimeLeft();
            this.updateDisplay(timeLeft);

            if (timeLeft.total <= 0 && !this.hasCompleted) {
                this.hasCompleted = true;
                clearInterval(this.interval);
                this.showBirthdayReached();
                if (this.options.onComplete) {
                    this.options.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    restart() {
        this.stop();
        this.hasCompleted = false;
        if (this.options.countdownContainer) {
            this.options.countdownContainer.style.display = 'flex';
        }
        if (this.options.birthdayReachedElement) {
            this.options.birthdayReachedElement.style.display = 'none';
        }
        this.start();
    }
}

// Age calculator utility
class AgeCalculator {
    constructor(birthDate) {
        this.birthDate = new Date(birthDate);
    }

    getAge() {
        const today = new Date();
        let age = today.getFullYear() - this.birthDate.getFullYear();
        const monthDiff = today.getMonth() - this.birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getDaysLived() {
        const today = new Date();
        const diffTime = Math.abs(today - this.birthDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getHoursLived() {
        const today = new Date();
        const diffTime = Math.abs(today - this.birthDate);
        return Math.ceil(diffTime / (1000 * 60 * 60));
    }

    getMinutesLived() {
        const today = new Date();
        const diffTime = Math.abs(today - this.birthDate);
        return Math.ceil(diffTime / (1000 * 60));
    }

    getNextBirthday() {
        const today = new Date();
        const nextBirthday = new Date(today.getFullYear(), this.birthDate.getMonth(), this.birthDate.getDate());
        
        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        return nextBirthday;
    }

    getDaysUntilBirthday() {
        const today = new Date();
        const nextBirthday = this.getNextBirthday();
        const diffTime = nextBirthday - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Special date formatter
class DateFormatter {
    static formatDate(date, format = 'long') {
        const options = {
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit', second: '2-digit' }
        };

        return new Date(date).toLocaleDateString('id-ID', options[format]);
    }

    static getZodiacSign(date) {
        const d = new Date(date);
        const month = d.getMonth() + 1;
        const day = d.getDate();

        const signs = [
            { name: 'Capricorn', symbol: '♑', start: [1, 1], end: [1, 19] },
            { name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18] },
            { name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20] },
            { name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19] },
            { name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20] },
            { name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20] },
            { name: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22] },
            { name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22] },
            { name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22] },
            { name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22] },
            { name: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21] },
            { name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21] },
            { name: 'Capricorn', symbol: '♑', start: [12, 22], end: [12, 31] }
        ];

        for (const sign of signs) {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;
            
            if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
                return sign;
            }
        }

        return signs[0]; // Default to Capricorn
    }

    static getChineseZodiac(year) {
        const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
        const emojis = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐴', '🐐', '🐒', '🐓', '🐕', '🐷'];
        const index = (year - 4) % 12;
        return { animal: animals[index], emoji: emojis[index] };
    }
}

// Export for use in other files
window.BirthdayCountdown = BirthdayCountdown;
window.AgeCalculator = AgeCalculator;
window.DateFormatter = DateFormatter;
