import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Sparkles, 
  Coins, 
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pinService } from '../../services/pinService';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import { PIN_CATEGORIES, PIN_FORMATS } from '../../data/categories';

export default function AddPinModal({ isOpen, onClose, onPinAdded }) {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(PIN_CATEGORIES[1]);
  const [format, setFormat] = useState('JPG');
  const [description, setDescription] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory(PIN_CATEGORIES[1]);
    setFormat('JPG');
    setDescription('');
    setAllowDownload(true);
    setImagePreview(null);
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh tối đa là 5MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    };
    reader.readAsDataURL(file);

    const ext = file.name.split('.').pop().toUpperCase();
    if (PIN_FORMATS.filter(f => f !== 'all').includes(ext)) {
      setFormat(ext);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề cho tác phẩm.', 'error');
      return;
    }

    // Wrap image into SVG image or SVG container
    let svgContent = '';
    if (imagePreview && imagePreview.startsWith('data:image')) {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <image href="${imagePreview}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </svg>`;
    } else {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
        <rect width="300" height="400" fill="#1E1B4B" rx="16"/>
        <circle cx="150" cy="180" r="70" fill="#4338CA"/>
        <text x="150" y="320" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FEF3C7" text-anchor="middle">${title}</text>
      </svg>`;
    }

    try {
      pinService.addPin({
        title: title.trim(),
        category,
        format,
        description: description.trim() || 'Tác phẩm nghệ thuật được chia sẻ trên OpenLib.',
        allowDownload,
        imageUrl: imagePreview || '',
        svgData: svgContent
      }, currentUser);

      refreshUser();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      showToast(`Đăng ảnh thành công! Bạn nhận ngay +15 điểm thưởng 🎉`, 'success');
      resetForm();
      onPinAdded();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">Chia sẻ tranh ảnh lên cộng đồng</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          
          {/* Points Bonus Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900 leading-snug">
              Bạn nhận ngay <strong>+15 điểm</strong> khi đăng thành công, và <strong>+5 điểm</strong> cho mỗi lượt tải của người khác!
            </p>
          </div>

          {/* Image Dropzone Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình ảnh tác phẩm (Tối đa 5MB):</label>
            <label
              htmlFor="pinFileInput"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleImageFile(e.dataTransfer.files[0]);
                }
              }}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                isDragging
                  ? 'border-amber-500 bg-amber-50'
                  : imagePreview
                  ? 'border-indigo-400 bg-slate-900'
                  : 'border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              {imagePreview ? (
                <div className="relative group/preview w-full flex flex-col items-center">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-52 rounded-xl object-contain shadow-md"
                  />
                  <span className="text-[11px] text-slate-300 mt-2 font-medium">Nhấp để chọn ảnh khác</span>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Kéo & thả ảnh hoặc nhấp để mở thư mục</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">JPEG, PNG, GIF, WebP, SVG (Max 5MB)</p>
                </div>
              )}

              <input
                id="pinFileInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                onChange={(e) => e.target.files && handleImageFile(e.target.files[0])}
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
              />
            </label>
          </div>

          {/* Form fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề tác phẩm *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tranh hoa sen cổ điển..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề thể loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
              >
                {PIN_CATEGORIES.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Định dạng file</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
              >
                {PIN_FORMATS.filter(f => f !== 'all').map(fmt => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả tác phẩm</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ câu chuyện hoặc phong cách nghệ thuật của bức ảnh..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Download Permission Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="allowDownloadCheck"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="allowDownloadCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
              Cho phép các thành viên khác tải tác phẩm này về máy
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Đăng tác phẩm (+15 điểm)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
