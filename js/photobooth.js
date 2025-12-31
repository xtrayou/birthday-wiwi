/* ========================================
   Photobooth JavaScript
======================================== */

class Photobooth {
    constructor() {
        this.video = document.getElementById('camera');
        this.canvas = document.getElementById('photoCanvas');
        this.capturedPhoto = document.getElementById('capturedPhoto');
        this.frameOverlay = document.getElementById('frameOverlay');
        this.stickersContainer = document.getElementById('stickersOnPhoto');
        this.countdownOverlay = document.getElementById('countdownOverlay');
        this.photoCountdown = document.getElementById('photoCountdown');
        this.flashEffect = document.getElementById('flashEffect');
        this.photoboothGallery = document.getElementById('photoboothGallery');

        this.stream = null;
        this.currentFrame = 'none';
        this.currentFilter = 'none';
        this.placedStickers = [];
        this.savedPhotos = [];
        this.isCapturing = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedPhotos();
        this.renderGallery();
    }

    bindEvents() {
        // Start Camera
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        
        // Capture Photo
        document.getElementById('captureBtn').addEventListener('click', () => this.captureWithCountdown());
        
        // Retake Photo
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakePhoto());
        
        // Download Photo
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPhoto());
        
        // Upload Photo
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Frame Selection
        document.querySelectorAll('.frame-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectFrame(e.target.dataset.frame));
        });

        // Filter Selection
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectFilter(e.target.dataset.filter));
        });

        // Sticker Selection
        document.querySelectorAll('.sticker-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.addSticker(e.target.dataset.sticker));
        });

        // Clear Stickers
        document.getElementById('clearStickers').addEventListener('click', () => this.clearStickers());
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 },
                audio: false
            });
            
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            this.capturedPhoto.style.display = 'none';
            
            document.getElementById('captureBtn').disabled = false;
            document.getElementById('startCamera').innerHTML = '<i class="fas fa-video-slash"></i><span>Matikan Kamera</span>';
            document.getElementById('startCamera').onclick = () => this.stopCamera();
            
            // Apply mirror effect
            this.video.style.transform = 'scaleX(-1)';
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Tidak dapat mengakses kamera. Pastikan browser memiliki izin kamera.');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        document.getElementById('captureBtn').disabled = true;
        document.getElementById('startCamera').innerHTML = '<i class="fas fa-video"></i><span>Nyalakan Kamera</span>';
        document.getElementById('startCamera').onclick = () => this.startCamera();
    }

    async captureWithCountdown() {
        if (this.isCapturing) return;
        this.isCapturing = true;

        this.countdownOverlay.classList.add('active');
        
        // Countdown 3..2..1
        for (let i = 3; i > 0; i--) {
            this.photoCountdown.textContent = i;
            this.photoCountdown.style.animation = 'none';
            this.photoCountdown.offsetHeight; // Trigger reflow
            this.photoCountdown.style.animation = 'pulse 0.5s ease infinite';
            
            // Play countdown sound (optional)
            this.playCountdownSound();
            
            await this.delay(1000);
        }
        
        this.countdownOverlay.classList.remove('active');
        
        // Flash effect
        this.flashEffect.classList.add('active');
        this.playShutterSound();
        
        setTimeout(() => {
            this.flashEffect.classList.remove('active');
        }, 300);

        // Capture the photo
        this.capturePhoto();
        this.isCapturing = false;
    }

    capturePhoto() {
        const ctx = this.canvas.getContext('2d');
        
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Save context state
        ctx.save();
        
        // Mirror the canvas to match the mirrored video
        ctx.translate(this.canvas.width, 0);
        ctx.scale(-1, 1);
        
        // Apply filter
        ctx.filter = this.getFilterValue(this.currentFilter);
        
        // Draw video frame
        ctx.drawImage(this.video, 0, 0);
        
        // Restore context
        ctx.restore();
        
        // Get image data
        const imageData = this.canvas.toDataURL('image/png');
        
        // Display captured photo
        this.capturedPhoto.src = imageData;
        this.capturedPhoto.style.display = 'block';
        this.capturedPhoto.style.transform = 'none'; // Remove mirror effect from captured photo
        this.video.style.display = 'none';
        
        // Apply filter to displayed image
        this.capturedPhoto.className = `captured-photo filter-${this.currentFilter}`;
        
        // Update buttons
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('retakeBtn').style.display = 'inline-flex';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        
        // Save to gallery
        this.savePhoto(imageData);
    }

    retakePhoto() {
        this.capturedPhoto.style.display = 'none';
        this.video.style.display = 'block';
        
        document.getElementById('captureBtn').style.display = 'inline-flex';
        document.getElementById('retakeBtn').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'none';
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.capturedPhoto.src = e.target.result;
            this.capturedPhoto.style.display = 'block';
            this.video.style.display = 'none';
            
            // Apply current filter
            this.capturedPhoto.className = `captured-photo filter-${this.currentFilter}`;
            
            // Update buttons
            document.getElementById('captureBtn').style.display = 'none';
            document.getElementById('retakeBtn').style.display = 'inline-flex';
            document.getElementById('downloadBtn').style.display = 'inline-flex';
            
            // Save to gallery
            this.savePhoto(e.target.result);
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        event.target.value = '';
    }

    selectFrame(frame) {
        this.currentFrame = frame;
        
        // Update active button
        document.querySelectorAll('.frame-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.frame === frame);
        });
        
        // Apply frame
        this.frameOverlay.className = 'frame-overlay';
        if (frame !== 'none') {
            this.frameOverlay.classList.add(frame);
        }
    }

    selectFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Apply filter to video
        this.video.className = `filter-${filter}`;
        
        // Apply filter to captured photo if visible
        if (this.capturedPhoto.style.display !== 'none') {
            this.capturedPhoto.className = `captured-photo filter-${filter}`;
        }
    }

    getFilterValue(filter) {
        const filters = {
            'none': 'none',
            'grayscale': 'grayscale(100%)',
            'sepia': 'sepia(80%)',
            'purple': 'hue-rotate(270deg) saturate(1.5)',
            'warm': 'sepia(30%) saturate(1.4)',
            'cool': 'hue-rotate(180deg) saturate(0.8)',
            'bright': 'brightness(1.2) contrast(1.1)'
        };
        return filters[filter] || 'none';
    }

    addSticker(emoji) {
        const sticker = document.createElement('div');
        sticker.className = 'placed-sticker';
        sticker.textContent = emoji;
        sticker.style.left = '50%';
        sticker.style.top = '50%';
        sticker.style.transform = 'translate(-50%, -50%)';
        
        this.stickersContainer.appendChild(sticker);
        this.placedStickers.push(sticker);
        
        // Make sticker draggable
        this.makeDraggable(sticker);
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const onMouseDown = (e) => {
            isDragging = true;
            element.classList.add('dragging');
            
            const rect = element.getBoundingClientRect();
            const containerRect = this.stickersContainer.getBoundingClientRect();
            
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;
            
            element.style.left = initialX + 'px';
            element.style.top = initialY + 'px';
            element.style.transform = 'none';
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            element.style.left = (initialX + deltaX) + 'px';
            element.style.top = (initialY + deltaY) + 'px';
        };

        const onMouseUp = () => {
            isDragging = false;
            element.classList.remove('dragging');
        };

        // Mouse events
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Touch events
        element.addEventListener('touchstart', onMouseDown);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
        
        // Double click to remove
        element.addEventListener('dblclick', () => {
            element.remove();
            this.placedStickers = this.placedStickers.filter(s => s !== element);
        });
    }

    clearStickers() {
        this.stickersContainer.innerHTML = '';
        this.placedStickers = [];
    }

    savePhoto(imageData) {
        const photo = {
            id: Date.now(),
            data: imageData,
            frame: this.currentFrame,
            filter: this.currentFilter,
            date: new Date().toISOString()
        };
        
        this.savedPhotos.unshift(photo);
        
        // Save to localStorage (limit to last 20 photos)
        const photosToSave = this.savedPhotos.slice(0, 20);
        try {
            localStorage.setItem('photoboothPhotos', JSON.stringify(photosToSave));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
        
        this.renderGallery();
    }

    loadSavedPhotos() {
        try {
            const saved = localStorage.getItem('photoboothPhotos');
            if (saved) {
                this.savedPhotos = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }

    renderGallery() {
        if (!this.photoboothGallery) return;

        if (this.savedPhotos.length === 0) {
            this.photoboothGallery.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-camera"></i>
                    <p>Belum ada foto. Ayo ambil foto pertamamu!</p>
                </div>
            `;
            return;
        }

        this.photoboothGallery.innerHTML = this.savedPhotos.map(photo => `
            <div class="gallery-item" data-id="${photo.id}">
                <img src="${photo.data}" alt="Photo ${photo.id}" class="filter-${photo.filter}">
                <div class="item-actions">
                    <button class="download-btn" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-btn" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind gallery events
        this.photoboothGallery.querySelectorAll('.gallery-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            
            item.querySelector('.download-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadPhotoById(id);
            });
            
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePhoto(id);
            });
            
            item.addEventListener('click', () => {
                this.openPhotoInLightbox(id);
            });
        });
    }

    downloadPhoto() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = this.capturedPhoto;
        
        canvas.width = img.naturalWidth || 1280;
        canvas.height = img.naturalHeight || 720;
        
        // Apply filter
        ctx.filter = this.getFilterValue(this.currentFilter);
        
        // Draw image
        const tempImg = new Image();
        tempImg.onload = () => {
            ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
            
            // Draw frame text if applicable
            this.drawFrameOnCanvas(ctx, canvas.width, canvas.height);
            
            // Draw stickers
            this.drawStickersOnCanvas(ctx, canvas.width, canvas.height);
            
            // Download
            const link = document.createElement('a');
            link.download = `widda-birthday-photo-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        tempImg.src = img.src;
    }

    drawFrameOnCanvas(ctx, width, height) {
        ctx.filter = 'none';
        ctx.font = 'bold 24px Poppins, sans-serif';
        ctx.textAlign = 'center';
        
        if (this.currentFrame === 'birthday') {
            // Top text
            ctx.fillStyle = 'rgba(255, 105, 180, 0.9)';
            ctx.fillRect(width/2 - 120, 10, 240, 35);
            ctx.fillStyle = 'white';
            ctx.fillText('🎂 Happy Birthday! 🎂', width/2, 35);
            
            // Bottom text
            ctx.fillStyle = 'rgba(147, 112, 219, 0.9)';
            ctx.fillRect(width/2 - 150, height - 45, 300, 35);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Poppins, sans-serif';
            ctx.fillText('✨ Widda Aulia Ditasari ✨', width/2, height - 20);
        }
    }

    drawStickersOnCanvas(ctx, width, height) {
        const containerRect = this.stickersContainer.getBoundingClientRect();
        
        this.placedStickers.forEach(sticker => {
            const rect = sticker.getBoundingClientRect();
            const x = ((rect.left - containerRect.left) / containerRect.width) * width;
            const y = ((rect.top - containerRect.top) / containerRect.height) * height;
            
            ctx.font = '50px serif';
            ctx.fillText(sticker.textContent, x, y + 40);
        });
    }

    downloadPhotoById(id) {
        const photo = this.savedPhotos.find(p => p.id === id);
        if (!photo) return;

        const link = document.createElement('a');
        link.download = `widda-birthday-photo-${id}.png`;
        link.href = photo.data;
        link.click();
    }

    deletePhoto(id) {
        if (confirm('Hapus foto ini?')) {
            this.savedPhotos = this.savedPhotos.filter(p => p.id !== id);
            try {
                localStorage.setItem('photoboothPhotos', JSON.stringify(this.savedPhotos));
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
            this.renderGallery();
        }
    }

    openPhotoInLightbox(id) {
        const photo = this.savedPhotos.find(p => p.id === id);
        if (!photo) return;

        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        
        if (lightbox && lightboxImage) {
            lightboxImage.src = photo.data;
            lightboxImage.className = `filter-${photo.filter}`;
            lightbox.classList.add('active');
        }
    }

    playCountdownSound() {
        // Create a simple beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio not supported
        }
    }

    playShutterSound() {
        // Create shutter click sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1000;
            oscillator.type = 'square';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Audio not supported
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize photobooth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.photobooth = new Photobooth();
});
