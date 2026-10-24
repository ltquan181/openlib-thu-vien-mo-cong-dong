import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  ArrowLeftRight, 
  BookmarkCheck, 
  BookOpen,
  Sparkles,
  Coins
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { bookService } from '../../services/bookService';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import { BOOK_CATEGORIES, BOOK_FORMATS } from '../../data/categories';

export default function AddBookModal({ isOpen, onClose, onBookAdded }) {
  const { currentUser, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [type, setType] = useState('borrow'); // 'borrow' | 'exchange'
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(BOOK_CATEGORIES[1]);
  const [format, setFormat] = useState('PDF');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState('2026');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [fileContentText, setFileContentText] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = () => {
    setType('borrow');
    setTitle('');
    setAuthor('');
    setCategory(BOOK_CATEGORIES[1]);
    setFormat('PDF');
    setLanguage('Tiếng Việt');
    setPublisher('');
    setPublishYear('2026');
    setCoverImageUrl('');
    setDescription('');
    setFileInfo(null);
    setFileContentText('');
    setFileDataUrl('');
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Dung lượng file vượt quá giới hạn 10MB!', 'error');
      return;
    }

    // Auto extract title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (!title) {
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Detect format
    const ext = file.name.split('.').pop().toUpperCase();
    if (ext === 'MP3') {
      setFormat('AUDIO');
    } else if (BOOK_FORMATS.filter(f => f !== 'all').includes(ext)) {
      setFormat(ext);
    }

    setFileInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    const lowerName = file.name.toLowerCase();

    // 1. Read text from .txt files
    if (lowerName.endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = (e) => {
        setFileContentText(e.target.result || '');
      };
      textReader.readAsText(file);
    }
    // 2. Read text from .docx files using mammoth
    else if (lowerName.endsWith('.docx')) {
      const arrayReader = new FileReader();
      arrayReader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer })
          .then((res) => {
            if (res && res.value) {
              setFileContentText(res.value);
            }
          })
          .catch((err) => {
            console.warn('DOCX parse:', err);
          });
      };
      arrayReader.readAsArrayBuffer(file);
    }

    // 3. Store dataURL for PDF or document rendering
    if (file.size <= 3.5 * 1024 * 1024) {
      const dataReader = new FileReader();
      dataReader.onload = (e) => {
        setFileDataUrl(e.target.result || '');
      };
      dataReader.readAsDataURL(file);
    }

    showToast(`Đã nhận file: ${file.name}`, 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      showToast('Vui lòng nhập tên sách và tác giả.', 'error');
      return;
    }

    // Generate reading chapters
    let readingContent = [];
    if (fileContentText && fileContentText.trim()) {
      const textParts = fileContentText.split(/(?=\n(?:\s*Chương|\s*Chapter|\s*Phần|\s*Hồi)\s*\d+)/i);
      if (textParts.length > 1) {
        readingContent = textParts.map((part, idx) => {
          const firstLine = part.trim().split('\n')[0] || `Chương ${idx + 1}`;
          return {
            chapter: firstLine.slice(0, 60),
            content: part.trim()
          };
        });
      } else {
        const text = fileContentText.trim();
        if (text.length > 5000) {
          const chunkSize = 3500;
          let i = 0;
          let chapterNum = 1;
          while (i < text.length) {
            readingContent.push({
              chapter: `Phần ${chapterNum}: ${title.trim().slice(0, 30)}`,
              content: text.slice(i, i + chunkSize)
            });
            i += chunkSize;
            chapterNum++;
          }
        } else {
          readingContent = [
            {
              chapter: 'Toàn văn: ' + title.trim(),
              content: text
            }
          ];
        }
      }
    } else {
      readingContent = [
        {
          chapter: 'Mục lục & Giới thiệu tác phẩm',
          content: `${title.trim()}\nTác giả: ${author.trim()} · Năm xuất bản: ${publishYear.trim() || '2026'}\nĐịnh dạng tài liệu: ${format}\n\n${description.trim() || 'Tác phẩm được chia sẻ bởi @' + currentUser.username + ' trên Thư viện cộng đồng OpenLib.'}`
        },
        {
          chapter: 'Chương 1: Nội dung chi tiết',
          content: `Tài liệu "${title.trim()}" đính kèm tệp gốc "${fileInfo ? fileInfo.name : title + '.' + format.toLowerCase()}".\n\n${description.trim() || 'Tác phẩm đã sẵn sàng để đọc trực tuyến trên OpenLib.'}\n\n(Bạn đọc đang đọc phiên bản chuẩn do thành viên @${currentUser.username} chia sẻ).`
        }
      ];
    }

    try {
      const newBook = bookService.addBook({
        title: title.trim(),
        author: author.trim(),
        category,
        type,
        format,
        language,
        publisher: publisher.trim() || 'Tự xuất bản',
        publishYear: publishYear.trim() || '2026',
        coverImage: coverImageUrl.trim(),
        description: description.trim() || 'Sách được chia sẻ bởi thành viên cộng đồng OpenLib.',
        fileName: fileInfo ? fileInfo.name : `${title}.pdf`,
        fileSize: fileInfo ? fileInfo.size : '1.5 MB',
        fileDataUrl: fileDataUrl || '',
        readingContent
      }, currentUser);

      refreshUser();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      showToast(`Đăng sách thành công! Bạn nhận ngay +15 điểm thưởng 🎉`, 'success');
      resetForm();
      onBookAdded();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  let modalBg = 'bg-white text-slate-900 border-slate-200';
  let inputBg = 'bg-white border-slate-200 text-slate-800';
  if (theme === 'sepia') {
    modalBg = 'bg-[#FAF3E0] text-[#433422] border-[#E8D9BD]';
    inputBg = 'bg-[#EFE5CE] border-[#E8D9BD] text-[#433422]';
  } else if (theme === 'dark') {
    modalBg = 'bg-[#151C2C] text-slate-100 border-[#1E293B]';
    inputBg = 'bg-[#0B0F19] border-[#1E293B] text-slate-100';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${modalBg}`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Đăng sách lên Thư viện cộng đồng</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full opacity-60 hover:opacity-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          
          {/* Points Bonus Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
              Bạn nhận ngay <strong>+15 điểm thưởng</strong> khi đăng sách mới, và <strong>+10 điểm</strong> cho mỗi lượt bạn đọc khác mượn sách của bạn!
            </p>
          </div>

          {/* Select Type: 2 Cards */}
          <div>
            <label className="block text-xs font-bold opacity-80 mb-2">Hình thức chia sẻ:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('borrow')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  type === 'borrow'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>📖 Cho mượn</span>
                </div>
                <p className="text-[11px] opacity-70">Người mượn −10đ, bạn nhận +10đ</p>
              </button>

              <button
                type="button"
                onClick={() => setType('exchange')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  type === 'exchange'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-xs'
                    : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-purple-700 dark:text-purple-300 mb-1">
                  <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                  <span>🔄 Trao đổi</span>
                </div>
                <p className="text-[11px] opacity-70">Đổi sách khác, cả 2 bên +5đ</p>
              </button>
            </div>
          </div>

          {/* HTML5 Drag & Drop Dropzone */}
          <div>
            <label className="block text-xs font-bold opacity-80 mb-1.5">File tài liệu đính kèm (Tối đa 10MB):</label>
            <label
              htmlFor="bookFileInput"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                  : fileInfo
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                  : 'border-black/15 dark:border-white/15 hover:border-emerald-400 bg-black/5 dark:bg-white/5'
              }`}
            >
              {fileInfo ? (
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">{fileInfo.name}</p>
                    <span className="text-[10px] opacity-70">{fileInfo.size} · Nhấp để đổi file</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-7 h-7 mx-auto opacity-40 mb-1" />
                  <p className="text-xs font-semibold">Kéo & thả file hoặc nhấp để mở thư mục</p>
                  <p className="text-[10px] opacity-60 mt-0.5">.pdf, .epub, .mobi, .txt, .docx (Max 10MB)</p>
                </div>
              )}
              <input
                id="bookFileInput"
                type="file"
                accept=".pdf,.epub,.mobi,.azw3,.txt,.docx,.doc"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
              />
            </label>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Tên sách *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Không Gia Đình"
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${inputBg}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Tác giả *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Hector Malot"
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${inputBg}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Thể loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${inputBg}`}
              >
                {BOOK_CATEGORIES.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Định dạng file</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${inputBg}`}
              >
                {BOOK_FORMATS.filter(f => f !== 'all').map(fmt => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Ngôn ngữ</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Tiếng Việt, Tiếng Anh..."
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-80 mb-1">Link ảnh bìa thật (Tùy chọn)</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold opacity-80 mb-1">Mô tả / Tóm tắt tác phẩm</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ đôi nét về cuốn sách để cộng đồng cùng biết..."
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${inputBg}`}
            />
          </div>

          {/* Form Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Đăng sách lên Thư viện (+15 điểm)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
