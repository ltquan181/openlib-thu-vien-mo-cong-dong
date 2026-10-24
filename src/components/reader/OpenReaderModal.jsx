import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Scroll, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  BookmarkCheck,
  BookOpen,
  FileText
} from 'lucide-react';

export default function OpenReaderModal({ book, isOpen, onClose }) {
  const [theme, setTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark'
  const [fontSize, setFontSize] = useState(18); // in px
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const isPdf = Boolean(
    book &&
    (book.format === 'PDF' || (book.fileName && book.fileName.toLowerCase().endsWith('.pdf'))) &&
    (book.fileDataUrl || book.fileUrl)
  );
  const [viewMode, setViewMode] = useState('reader'); // 'reader' | 'pdf'

  useEffect(() => {
    setCurrentChapterIndex(0);
    if (book) {
      const hasPdf = (book.format === 'PDF' || (book.fileName && book.fileName.toLowerCase().endsWith('.pdf'))) && Boolean(book.fileDataUrl || book.fileUrl);
      setViewMode(hasPdf ? 'pdf' : 'reader');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  // Safe chapters parsing to guarantee no crashes regardless of format
  const rawChapters = Array.isArray(book.readingContent) && book.readingContent.length > 0
    ? book.readingContent
    : [
        {
          chapter: 'Mở đầu: ' + (book.title || 'Tác phẩm'),
          content: typeof book.readingContent === 'string' && book.readingContent.trim()
            ? book.readingContent
            : (book.description || 'Nội dung sách đọc trực tuyến đang được đồng bộ.')
        }
      ];

  const chapters = rawChapters.map((ch, idx) => ({
    chapter: (ch && typeof ch === 'object' && ch.chapter) ? ch.chapter : `Chương ${idx + 1}`,
    content: (ch && typeof ch === 'object' && ch.content) ? ch.content : (typeof ch === 'string' ? ch : (book.description || 'Đang cập nhật nội dung...'))
  }));

  const safeIndex = Math.min(Math.max(0, currentChapterIndex), chapters.length - 1);
  const currentChapter = chapters[safeIndex] || { chapter: 'Nội dung', content: 'Đang tải...' };
  const progressPercent = Math.round(((safeIndex + 1) / chapters.length) * 100);

  // Theme styling rules
  let themeContainerClass = 'bg-[#FBF0D9] text-[#433422]';
  let themeNavClass = 'bg-[#F6E6C3] border-[#E8D5AC] text-[#433422]';

  if (theme === 'light') {
    themeContainerClass = 'bg-white text-slate-800';
    themeNavClass = 'bg-slate-50 border-slate-200 text-slate-700';
  } else if (theme === 'dark') {
    themeContainerClass = 'bg-[#0B0F19] text-[#CBD5E1]';
    themeNavClass = 'bg-[#151C2C] border-[#1E293B] text-slate-300';
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full h-full sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-200 ${
          isFullscreen ? 'fixed inset-0 rounded-none z-50' : 'sm:max-w-4xl sm:max-h-[92vh]'
        } ${themeContainerClass}`}
      >
        
        {/* Top Reading Toolbar */}
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0 ${themeNavClass}`}>
          
          {/* Book Title & Chapter */}
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="overflow-hidden">
              <h3 className="font-bold text-xs sm:text-sm truncate leading-tight">{book.title}</h3>
              <p className="text-[11px] opacity-75 truncate">
                {book.author} · {viewMode === 'pdf' ? 'Tài liệu PDF gốc' : currentChapter.chapter}
              </p>
            </div>
          </div>

          {/* Mode Switcher for PDF */}
          {isPdf && (
            <div className="flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-lg text-xs font-bold shrink-0">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'pdf' ? 'bg-emerald-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tệp PDF gốc</span>
              </button>
              <button
                onClick={() => setViewMode('reader')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'reader' ? 'bg-emerald-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chương số hóa</span>
              </button>
            </div>
          )}

          {/* Controls: Themes, Font size, Fullscreen, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Theme switcher */}
            {viewMode === 'reader' && (
              <div className="flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/10 gap-0.5">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                  title="Chế độ Sáng"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('sepia')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'sepia' ? 'bg-[#FBF0D9] text-[#78350F] shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                  title="Chế độ Giấy ấm Sepia"
                >
                  <Scroll className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-800 text-emerald-300 shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                  title="Chế độ Ban đêm"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Font size adjustments */}
            {viewMode === 'reader' && (
              <div className="hidden sm:flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/10 gap-1 text-xs font-bold">
                <button
                  onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  title="Thu nhỏ chữ"
                >
                  A-
                </button>
                <span className="text-[10px] opacity-60 w-6 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  title="Phóng to chữ"
                >
                  A+
                </button>
              </div>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
              title="Đóng trình đọc"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Reader Document Body */}
        {viewMode === 'pdf' && isPdf ? (
          <div className="flex-1 w-full h-full bg-slate-900 p-2 sm:p-4 flex flex-col">
            <iframe
              src={book.fileDataUrl || book.fileUrl}
              className="w-full flex-1 rounded-xl border border-white/10 bg-white"
              title={book.title}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 sm:py-12 select-text">
            <div className="max-w-2xl mx-auto text-left">
              
              {/* Chapter Heading */}
              <div className="mb-8 pb-4 border-b border-current opacity-25">
                <span className="text-xs uppercase tracking-widest font-bold opacity-75">
                  Chương {safeIndex + 1} / {chapters.length}
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold mt-1.5 tracking-tight">
                  {currentChapter.chapter}
                </h1>
              </div>

              {/* Chapter Paragraphs */}
              <div 
                className="font-serif leading-relaxed whitespace-pre-line text-justify"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
              >
                {currentChapter.content}
              </div>

              {/* End of Chapter flourish */}
              <div className="my-12 text-center opacity-40 font-serif">
                ✦ ✦ ✦
              </div>

            </div>
          </div>
        )}

        {/* Bottom Pagination & Progress Bar (Reader Mode Only) */}
        {viewMode === 'reader' && (
          <div className={`px-4 sm:px-8 py-3 border-t flex items-center justify-between gap-4 shrink-0 text-xs ${themeNavClass}`}>
            
            <button
              disabled={safeIndex === 0}
              onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Chương trước</span>
            </button>

            <div className="flex-1 max-w-xs flex flex-col items-center gap-1">
              <span className="font-semibold text-[11px] opacity-75">
                Tiến độ: {progressPercent}% ({safeIndex + 1}/{chapters.length})
              </span>
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              disabled={safeIndex >= chapters.length - 1}
              onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <span>Chương sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
