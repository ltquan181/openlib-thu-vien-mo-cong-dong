import { storageService } from './storageService';
import { pointService } from './pointService';
import { getAssetUrl } from '../utils/assetHelper';

export const pinService = {
  getPins() {
    return storageService.getPins();
  },

  getPinById(id) {
    const pins = storageService.getPins();
    return pins.find(p => p.id === id);
  },

  likePin(id, user) {
    const pins = storageService.getPins();
    const pin = pins.find(p => p.id === id);
    if (!pin) return null;

    let isLiked = false;
    if (user && user.id) {
      isLiked = storageService.toggleLikedPin(user.id, id);
      if (isLiked) {
        pin.likes = (pin.likes || 0) + 1;
      } else {
        pin.likes = Math.max(0, (pin.likes || 1) - 1);
      }
    } else {
      pin.likes = (pin.likes || 0) + 1;
      isLiked = true;
    }

    storageService.savePins(pins);
    return { pin, isLiked };
  },

  incrementView(id) {
    const pins = storageService.getPins();
    const pin = pins.find(p => p.id === id);
    if (!pin) return null;

    pin.views = (pin.views || 0) + 1;
    storageService.savePins(pins);
    return pin;
  },

  downloadPin(id, user) {
    const pin = this.getPinById(id);
    if (!pin) throw new Error('Không tìm thấy ảnh.');

    const check = pointService.canDownloadPin(user, pin);
    if (!check.allowed) throw new Error(check.reason);

    // If not owner, deduct 10 points from downloader and give 5 points to creator
    if (!check.isOwner) {
      pointService.addPoints(user.id, -10, 'download_pin', `Tải ảnh: ${pin.title}`);
      pointService.addPoints(pin.authorId, 5, 'pin_downloaded', `Ảnh được tải: ${pin.title}`);
    }

    // Increment downloads count
    const pins = storageService.getPins();
    const pIndex = pins.findIndex(p => p.id === id);
    pins[pIndex].downloads = (pins[pIndex].downloads || 0) + 1;
    storageService.savePins(pins);

    // Trigger file download in browser
    this.triggerDownload(pin);

    return pins[pIndex];
  },

  async triggerDownload(pin) {
    try {
      const ext = (pin.format || 'jpg').toLowerCase();
      const sanitizedTitle = (pin.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_') || 'openlib_art').slice(0, 50);
      const filename = `${sanitizedTitle}.${ext}`;

      // Case 1: Image has real dataUrl or URL
      if (pin.imageUrl) {
        if (pin.imageUrl.startsWith('data:')) {
          // Parse base64 data URL
          const parts = pin.imageUrl.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          let mime = mimeMatch ? mimeMatch[1] : '';
          if (!mime) {
            mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
          }
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        } else {
          // Resolve relative URL (including GitHub Pages base path)
          const resolvedUrl = getAssetUrl(pin.imageUrl);

          // Force real binary file download using fetch Blob
          try {
            const resp = await fetch(resolvedUrl);
            if (resp.ok) {
              const blob = await resp.blob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              return;
            }
          } catch (fetchErr) {
            console.warn('Fetch blob download failed, falling back to direct link:', fetchErr);
          }

          // Fallback direct link
          const link = document.createElement('a');
          link.href = resolvedUrl;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      }

      // Case 2: SVG content fallback
      const blob = new Blob([pin.svgData || ''], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizedTitle}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Trigger download failed:', e);
    }
  },

  addPin(newPinData, user) {
    const pins = storageService.getPins();

    // Hệ thống kiểm tra tự động chống gian lận/spam farm điểm
    const cleanTitle = (newPinData.title || '').trim().toLowerCase();
    const cleanImg = (newPinData.imageUrl || '').trim();

    const isDuplicate = pins.some(p => {
      const titleMatch = (p.title || '').trim().toLowerCase() === cleanTitle;
      const imgMatch = cleanImg && p.imageUrl && p.imageUrl === cleanImg;
      return titleMatch || imgMatch;
    });

    if (isDuplicate) {
      throw new Error('Hệ thống phát hiện tác phẩm ảnh này đã tồn tại trên thư viện! Mỗi ảnh là riêng biệt, không được phép đăng trùng lặp để tích điểm.');
    }

    // Reward creator +15 points immediately
    pointService.addPoints(user.id, 15, 'post_pin', `Đăng tác phẩm ảnh: ${newPinData.title}`);

    const newPin = {
      id: 'pin_' + Date.now(),
      title: newPinData.title,
      category: newPinData.category || 'Nghệ thuật cổ điển',
      format: newPinData.format || 'JPG',
      authorId: user.id,
      authorUsername: user.username,
      authorName: user.displayName || user.username,
      allowDownload: newPinData.allowDownload !== false,
      views: 1,
      likes: 0,
      downloads: 0,
      aspectRatio: newPinData.aspectRatio || 'aspect-[3/4]',
      height: newPinData.height || 'h-80',
      description: newPinData.description || 'Tác phẩm được chia sẻ bởi thành viên cộng đồng OpenLib.',
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: newPinData.imageUrl || '',
      svgData: newPinData.svgData || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
        <rect width="300" height="400" fill="#1E1B4B" rx="16"/>
        <circle cx="150" cy="180" r="70" fill="#4338CA"/>
        <text x="150" y="320" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FEF3C7" text-anchor="middle">${newPinData.title}</text>
      </svg>`
    };

    pins.unshift(newPin);
    storageService.savePins(pins);
    return newPin;
  },

  toggleDownloadLock(id, user) {
    const pins = storageService.getPins();
    const pin = pins.find(p => p.id === id);
    if (!pin) throw new Error('Không tìm thấy ảnh.');
    if (pin.authorId !== user.id) throw new Error('Bạn không có quyền chỉnh sửa ảnh này.');

    pin.allowDownload = !pin.allowDownload;
    storageService.savePins(pins);
    return pin;
  },

  deletePin(id, user) {
    const pins = storageService.getPins();
    const pin = pins.find(p => p.id === id);
    if (!pin) throw new Error('Không tìm thấy ảnh.');
    if (pin.authorId !== user.id) throw new Error('Bạn không có quyền xóa ảnh này.');

    const filtered = pins.filter(p => p.id !== id);
    storageService.savePins(filtered);
    return true;
  }
};
