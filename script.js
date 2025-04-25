document.addEventListener('DOMContentLoaded', () => {
    const qrForm = document.getElementById('qr-form');
    const qrContent = document.getElementById('qr-content');
    const qrType = document.getElementById('qr-type');
    const qrColor = document.getElementById('qr-color');
    const qrBgColor = document.getElementById('qr-bgcolor');
    const qrSize = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    const qrMargin = document.getElementById('qr-margin');
    const marginValue = document.getElementById('margin-value');
    const qrEcc = document.getElementById('qr-ecc');
    const qrLogo = document.getElementById('qr-logo');
    const livePreview = document.getElementById('live-preview');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveSettings = document.getElementById('save-settings');
    const clearBtn = document.getElementById('clear-btn');
    const qrCodeDiv = document.getElementById('qr-code');
    const qrLoading = document.getElementById('qr-loading');
    const qrStatus = document.getElementById('qr-status');
    const qrVersion = document.getElementById('qr-version');
    const qrModules = document.getElementById('qr-modules');
    const qrEccLevel = document.getElementById('qr-ecc-level');
    const charCounter = document.getElementById('char-counter');
    const themeToggle = document.getElementById('theme-toggle');

    let qr = new QRCode(qrCodeDiv, {
        width: parseInt(qrSize.value),
        height: parseInt(qrSize.value),
        colorDark: qrColor.value,
        colorLight: qrBgColor.value,
        correctLevel: QRCode.CorrectLevel[qrEcc.value],
        margin: parseInt(qrMargin.value)
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        themeToggle.querySelector('i').classList.toggle('fa-sun');
        themeToggle.querySelector('i').classList.toggle('fa-moon');
    });

    // Update size and margin display
    qrSize.addEventListener('input', () => {
        sizeValue.textContent = `${qrSize.value}px`;
        if (livePreview.checked) generateQRCode();
    });

    qrMargin.addEventListener('input', () => {
        marginValue.textContent = qrMargin.value;
        if (livePreview.checked) generateQRCode();
    });

    // Character counter
    qrContent.addEventListener('input', () => {
        const count = qrContent.value.length;
        charCounter.textContent = `Characters: ${count} / Max: 2953`;
        if (count > 2953) {
            charCounter.classList.add('warning');
        } else {
            charCounter.classList.remove('warning');
        }
        if (livePreview.checked) generateQRCode();
    });

    // Live preview for other inputs
    [qrType, qrColor, qrBgColor, qrEcc, qrLogo].forEach(input => {
        input.addEventListener('change', () => {
            if (livePreview.checked) generateQRCode();
        });
    });

    // Generate QR Code
    function generateQRCode() {
        if (!qrContent.value.trim()) {
            showNotification('Please enter content to encode', 'error');
            return;
        }

        qrLoading.classList.add('active');
        qrCodeDiv.innerHTML = '';

        let content = qrContent.value;
        switch (qrType.value) {
            case 'url':
                content = content.startsWith('http') ? content : `https://${content}`;
                break;
            case 'vcard':
                content = `BEGIN:VCARD\nVERSION:3.0\nN:${content}\nEND:VCARD`;
                break;
            case 'wifi':
                content = `WIFI:S:${content};;`;
                break;
            case 'sms':
                content = `SMSTO::${content}`;
                break;
        }

        qr = new QRCode(qrCodeDiv, {
            text: content,
            width: parseInt(qrSize.value),
            height: parseInt(qrSize.value),
            colorDark: qrColor.value,
            colorLight: qrBgColor.value,
            correctLevel: QRCode.CorrectLevel[qrEcc.value],
            margin: parseInt(qrMargin.value)
        });

        setTimeout(() => {
            qrLoading.classList.remove('active');
            qrCodeDiv.classList.add('loaded');

            // Update stats
            const modules = qr._oQRCode.moduleCount;
            qrVersion.textContent = qr._oQRCode.version;
            qrModules.textContent = `${modules}x${modules}`;
            qrEccLevel.textContent = qrEcc.value;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Handle logo overlay
            if (qrLogo.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const canvas = qrCodeDiv.querySelector('canvas');
                        const ctx = canvas.getContext('2d');
                        const logoSize = canvas.width * 0.2;
                        const x = (canvas.width - logoSize) / 2;
                        const y = (canvas.height - logoSize) / 2;
                        ctx.drawImage(img, x, y, logoSize, logoSize);
                    };
                };
                reader.readAsDataURL(qrLogo.files[0]);
            }

            showNotification('QR Code generated successfully', 'success');
        }, 500);
    }

    // Generate button
    generateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        generateQRCode();
    });

    // Download QR Code
    downloadBtn.addEventListener('click', () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) {
            showNotification('No QR Code to download', 'error');
            return;
        }
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'qrcode.png';
        link.click();
        showNotification('QR Code downloaded', 'success');
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) {
            showNotification('No QR Code to copy', 'error');
            return;
        }
        canvas.toBlob(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write(item).then(() => {
                showNotification('QR Code copied to clipboard', 'success');
            }).catch(() => {
                showNotification('Failed to copy QR Code', 'error');
            });
        });
    });

    // Save Settings
    saveSettings.addEventListener('click', () => {
        const settings = {
            type: qrType.value,
            color: qrColor.value,
            bgcolor: qrBgColor.value,
            size: qrSize.value,
            ecc: qrEcc.value,
            margin: qrMargin.value,
            livePreview: livePreview.checked
        };
        localStorage.setItem('qrSettings', JSON.stringify(settings));
        showNotification('Settings saved', 'success');
    });

    // Load Settings
    const savedSettings = localStorage.getItem('qrSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        qrType.value = settings.type;
        qrColor.value = settings.color;
        qrBgColor.value = settings.bgcolor;
        qrSize.value = settings.size;
        sizeValue.textContent = `${settings.size}px`;
        qrEcc.value = settings.ecc;
        qrMargin.value = settings.margin;
        marginValue.textContent = settings.margin;
        livePreview.checked = settings.livePreview;
    }

    // Clear Form
    clearBtn.addEventListener('click', () => {
        qrForm.reset();
        qrContent.value = '';
        qrColor.value = '#000000';
        qrBgColor.value = '#ffffff';
        qrSize.value = 200;
        sizeValue.textContent = '200px';
        qrEcc.value = 'M';
        qrMargin.value = 4;
        marginValue.textContent = '4';
        livePreview.checked = false;
        qrLogo.value = '';
        qrCodeDiv.innerHTML = '';
        qrVersion.textContent = '-';
        qrModules.textContent = '-';
        qrEccLevel.textContent = '-';
        charCounter.textContent = 'Characters: 0 / Max: 2953';
        localStorage.removeItem('qrSettings');
        showNotification('Form cleared', 'info');
    });

    // Notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000);
    }
});