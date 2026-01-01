const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = './images';

// Fungsi untuk mendapatkan semua file gambar secara rekursif
function getImageFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('backup')) {
            getImageFiles(fullPath, files);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                files.push(fullPath);
            }
        }
    }
    
    return files;
}

// Fungsi untuk mengompres gambar
async function compressImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    const dir = path.dirname(inputPath);
    const filename = path.basename(inputPath);
    
    // Backup file asli
    const backupDir = path.join(dir, 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupPath = path.join(backupDir, filename);
    
    // Cek apakah sudah ada backup, jika belum buat backup
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(inputPath, backupPath);
    }
    
    try {
        // Baca file sebagai buffer untuk menghindari masalah path
        const inputBuffer = fs.readFileSync(inputPath);
        const originalSize = inputBuffer.length;
        
        let outputBuffer;
        
        if (ext === '.png') {
            outputBuffer = await sharp(inputBuffer)
                .png({ quality: 70, compressionLevel: 9 })
                .toBuffer();
        } else {
            // JPEG
            outputBuffer = await sharp(inputBuffer)
                .jpeg({ quality: 70, mozjpeg: true })
                .toBuffer();
        }
        
        // Simpan file yang sudah dikompres
        fs.writeFileSync(inputPath, outputBuffer);
        
        const newSize = outputBuffer.length;
        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
        
        console.log(`✓ ${inputPath}`);
        console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB → Compressed: ${(newSize / 1024).toFixed(2)} KB (${savings}% saved)`);
        
        return { original: originalSize, compressed: newSize };
    } catch (error) {
        console.error(`✗ Error processing ${inputPath}: ${error.message}`);
        return { original: 0, compressed: 0 };
    }
}

// Main function
async function main() {
    console.log('🖼️  Image Compression Tool\n');
    console.log('Mencari gambar di folder images...\n');
    
    const imageFiles = getImageFiles(imagesDir);
    
    console.log(`Ditemukan ${imageFiles.length} gambar untuk dikompres.\n`);
    console.log('='.repeat(60) + '\n');
    
    let totalOriginal = 0;
    let totalCompressed = 0;
    
    for (const file of imageFiles) {
        const result = await compressImage(file);
        totalOriginal += result.original;
        totalCompressed += result.compressed;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`Total Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Compressed: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`);
    
    if (totalOriginal > 0) {
        console.log(`Total Saved: ${((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(2)} MB (${((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(2)}%)`);
    }
    
    console.log('\n✅ Gambar asli di-backup di folder "backup" di setiap direktori.');
}

main().catch(console.error);
