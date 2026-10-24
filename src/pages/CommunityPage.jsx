import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Image as ImageIcon, 
  ArrowLeftRight, 
  BookmarkCheck, 
  Sparkles, 
  Filter, 
  Coins,
  Layers,
  Search,
  ArrowUpDown,
  FileText,
  Download,
  Lock,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';
import BookCard from '../components/library/BookCard';
import MasonryGrid from '../components/pinterest/MasonryGrid';
import Pagination from '../components/common/Pagination';
import { BOOK_CATEGORIES, BOOK_FORMATS, PIN_CATEGORIES, PIN_FORMATS } from '../data/categories';

export default function CommunityPage({ onOpenBookDetail, onQuickRead, onOpenPinDetail, onQuickDownload, onLikePin }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [activeMainTab, setActiveMainTab] = useState('books'); // 'books' | 'pins'

  // Books filters & sort
  const [bookTypeFilter, setBookTypeFilter] = useState('all'); // 'all' | 'exchange' | 'borrow'
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');
  const [bookSort, setBookSort] = useState('newest'); // 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'year'
  const [bookFormatFilter, setBookFormatFilter] = useState('all'); // 'all' | 'PDF' | 'EPUB'
  const [bookPage, setBookPage] = useState(1);
  const BOOKS_PER_PAGE = 12;

  // Pins filters & sort
  const [pinDownloadFilter, setPinDownloadFilter] = useState('all'); // 'all' | 'allowed' | 'locked'
  const [pinCategoryFilter, setPinCategoryFilter] = useState('all');
  const [pinSort, setPinSort] = useState('newest'); // 'newest' | 'likes' | 'downloads' | 'views' | 'title-asc'
  const [pinFormatFilter, setPinFormatFilter] = useState('all'); // 'all' | 'JPG' | 'PNG' | 'WEBP'
  const [pinPage, setPinPage] = useState(1);
  const PINS_PER_PAGE = 20;

  const [scrollY, setScrollY] = useState(0);

  // Scroll listener for banner parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allBooks = storageService.getBooks();
  const allPins = storageService.getPins();

  // Chỉ hiển thị các sách đang sẵn sàng (khi được mượn/đổi sẽ tự động ẩn khỏi cộng đồng cho đến khi được hoàn trả)
  const communityBooks = allBooks.filter(b => b.status === 'available');

  const filteredBooks = communityBooks.filter(b => {
    if (bookTypeFilter !== 'all' && b.type !== bookTypeFilter) return false;
    if (bookCategoryFilter !== 'all' && b.category !== bookCategoryFilter) return false;
    if (bookFormatFilter !== 'all' && b.format !== bookFormatFilter) return false;
    return true;
  });

  const displayBooks = [...filteredBooks].sort((a, b) => {
    if (bookSort === 'oldest') {
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    }
    if (bookSort === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '', 'vi');
    }
    if (bookSort === 'title-desc') {
      return (b.title || '').localeCompare(a.title || '', 'vi');
    }
    if (bookSort === 'year') {
      return parseInt(b.publishYear || '0') - parseInt(a.publishYear || '0');
    }
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const filteredPins = allPins.filter(p => {
    if (pinDownloadFilter === 'allowed' && !p.allowDownload) return false;
    if (pinDownloadFilter === 'locked' && p.allowDownload) return false;
    if (pinCategoryFilter !== 'all' && p.category !== pinCategoryFilter) return false;
    if (pinFormatFilter !== 'all') {
      const pFormat = p.format || 'JPG';
      if (pFormat.toUpperCase() !== pinFormatFilter.toUpperCase()) return false;
    }
    return true;
  });

  const displayPins = [...filteredPins].sort((a, b) => {
    if (pinSort === 'likes') {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (pinSort === 'downloads') {
      return (b.downloads || 0) - (a.downloads || 0);
    }
    if (pinSort === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    if (pinSort === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '', 'vi');
    }
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  // Pagination for Books (12 books per page)
  const totalBookPages = Math.ceil(displayBooks.length / BOOKS_PER_PAGE) || 1;
  const currentValidBookPage = Math.min(bookPage, totalBookPages);
  const paginatedBooks = displayBooks.slice(
    (currentValidBookPage - 1) * BOOKS_PER_PAGE,
    currentValidBookPage * BOOKS_PER_PAGE
  );

  const handleBookPageChange = (newPage) => {
    setBookPage(newPage);
    const el = document.getElementById('community-content-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Pagination for Pins (20 pins per page)
  const totalPinPages = Math.ceil(displayPins.length / PINS_PER_PAGE) || 1;
  const currentValidPinPage = Math.min(pinPage, totalPinPages);
  const paginatedPins = displayPins.slice(
    (currentValidPinPage - 1) * PINS_PER_PAGE,
    currentValidPinPage * PINS_PER_PAGE
  );

  const handlePinPageChange = (newPage) => {
    setPinPage(newPage);
    const el = document.getElementById('community-content-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset book page when filters change
  useEffect(() => {
    setBookPage(1);
  }, [bookTypeFilter, bookCategoryFilter, bookSort, bookFormatFilter]);

  // Reset pin page when filters change
  useEffect(() => {
    setPinPage(1);
  }, [pinDownloadFilter, pinCategoryFilter, pinSort, pinFormatFilter]);

  return (
    <div className="min-h-screen pb-16">
      
      {/* Banner chính: Hình nền Kệ sách tri thức dịu sáng + Hiệu ứng chuyển động khi cuộn */}
      <section className={`relative overflow-hidden ${
        theme === 'sepia' 
          ? 'bg-[#3C2D1F]' 
          : theme === 'dark' 
            ? 'bg-[#0E1F14]' 
            : 'bg-[#235630]'
      } text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-black/15 shadow-sm`}>
        
        {/* Bookshelf Background Image with Parallax & Soft Light */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-700 ease-out will-change-transform mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507842229447-759021877f24?w=1600&auto=format&fit=crop&q=80')`,
            transform: `translateY(${scrollY * 0.25}px) scale(${1 + scrollY * 0.0003})`
          }}
        />

        {/* Lớp phủ màu xanh cỏ cây tươi sáng, dịu mắt (Không còn bị tối đen) */}
        <div className={`absolute inset-0 pointer-events-none ${
          theme === 'sepia'
            ? 'bg-gradient-to-b from-[#4A3929]/85 via-[#5A4532]/75 to-[#3C2D1F]/90'
            : theme === 'dark'
              ? 'bg-gradient-to-b from-[#132B1B]/90 via-[#1C3E27]/80 to-[#0E1F14]/95'
              : 'bg-gradient-to-b from-[#2A6539]/85 via-[#377E4A]/75 to-[#20502C]/90'
        }`} />
        
        {/* Ánh sáng vàng dịu tự nhiên tỏa từ đỉnh banner */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300/20 via-emerald-400/15 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs text-amber-200 font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Thư viện Mở Cộng đồng — Tri thức Lan tỏa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-serif mb-4 drop-shadow-md text-white">
            Không gian Đọc & Cảm hứng Cộng đồng
          </h1>

          <p className="text-xs sm:text-base text-emerald-50 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            Khám phá hàng ngàn cuốn sách hay, đọc online trực tiếp trên trình duyệt, trao đổi tài liệu ngang hàng hoặc chiêm ngưỡng những tác phẩm nghệ thuật sống động.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main id="community-content-start" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* 2 Main Centered Large Tabs (Kho sách cộng đồng vs Kho ảnh cộng đồng) */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 pt-2 pb-6">
          <button
            onClick={() => setActiveMainTab('books')}
            className={`flex items-center gap-3 px-6 py-3.5 sm:px-10 sm:py-4 rounded-3xl text-sm sm:text-base font-extrabold transition-all duration-200 shadow-md active:scale-95 ${
              activeMainTab === 'books'
                ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400 scale-105'
                : 'bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:scale-[1.02]'
            }`}
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
            <span>Kho sách cộng đồng</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeMainTab === 'books' ? 'bg-emerald-950/60 text-emerald-100' : 'bg-black/10 dark:bg-white/10'
            }`}>
              {communityBooks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('pins')}
            className={`flex items-center gap-3 px-6 py-3.5 sm:px-10 sm:py-4 rounded-3xl text-sm sm:text-base font-extrabold transition-all duration-200 shadow-md active:scale-95 ${
              activeMainTab === 'pins'
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400 scale-105'
                : 'bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:scale-[1.02]'
            }`}
          >
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            <span>Kho ảnh cộng đồng</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeMainTab === 'pins' ? 'bg-amber-600/40 text-slate-950' : 'bg-black/10 dark:bg-white/10'
            }`}>
              {allPins.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KHO SÁCH CỘNG ĐỒNG CONTROLS */}
        {/* ========================================================================= */}
        {activeMainTab === 'books' && (
          <div className="mb-6 space-y-2.5">
            {/* Hàng 1: Nút phân loại sách (Tất cả / Trao đổi sách / Mượn sách) - Đặt góc trái & Thu gọn */}
            <div className="flex flex-wrap items-center justify-start gap-2">
              <button
                onClick={() => setBookTypeFilter('all')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  bookTypeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {communityBooks.length}
                </span>
              </button>

              <button
                onClick={() => setBookTypeFilter('exchange')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  bookTypeFilter === 'exchange'
                    ? 'bg-purple-700 text-white shadow-purple-700/25 ring-2 ring-purple-500'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100 text-purple-700 dark:text-purple-300'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Trao đổi sách</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {communityBooks.filter(b => b.type === 'exchange').length}
                </span>
              </button>

              <button
                onClick={() => setBookTypeFilter('borrow')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  bookTypeFilter === 'borrow'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Mượn sách</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {communityBooks.filter(b => b.type === 'borrow').length}
                </span>
              </button>
            </div>

            {/* Hàng 2: Nút Thể loại, Sắp xếp, Định dạng - Đặt góc trái & Thu gọn */}
            <div className="flex flex-wrap items-center justify-start gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-fit max-w-full">
              {/* Nút Thể loại */}
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-emerald-600 dark:text-emerald-400" />
                <select
                  value={bookCategoryFilter}
                  onChange={(e) => setBookCategoryFilter(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="all">Thể loại: Tất cả</option>
                  {BOOK_CATEGORIES.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>Thể loại: {cat}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Sắp xếp */}
              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-emerald-600 dark:text-emerald-400" />
                <select
                  value={bookSort}
                  onChange={(e) => setBookSort(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="oldest">Sắp xếp: Cũ nhất</option>
                  <option value="title-asc">Sắp xếp: Tên A → Z</option>
                  <option value="title-desc">Sắp xếp: Tên Z → A</option>
                  <option value="year">Sắp xếp: Năm xuất bản</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Định dạng */}
              <div className="relative">
                <FileText className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-emerald-600 dark:text-emerald-400" />
                <select
                  value={bookFormatFilter}
                  onChange={(e) => setBookFormatFilter(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="all">Định dạng: Tất cả</option>
                  {BOOK_FORMATS.filter(f => f !== 'all').map(fmt => (
                    <option key={fmt} value={fmt}>Định dạng: {fmt}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Đặt lại nếu đang có lọc */}
              {(bookTypeFilter !== 'all' || bookCategoryFilter !== 'all' || bookFormatFilter !== 'all' || bookSort !== 'newest') && (
                <button
                  onClick={() => {
                    setBookTypeFilter('all');
                    setBookCategoryFilter('all');
                    setBookFormatFilter('all');
                    setBookSort('newest');
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KHO ẢNH CỘNG ĐỒNG CONTROLS */}
        {/* ========================================================================= */}
        {activeMainTab === 'pins' && (
          <div className="mb-6 space-y-2.5">
            {/* Hàng 1: Nút phân loại ảnh (Tất cả / Được phép tải / Khóa tải) - Đặt góc trái & Thu gọn */}
            <div className="flex flex-wrap items-center justify-start gap-2">
              <button
                onClick={() => setPinDownloadFilter('all')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  pinDownloadFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {allPins.length}
                </span>
              </button>

              <button
                onClick={() => setPinDownloadFilter('allowed')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  pinDownloadFilter === 'allowed'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Được phép tải</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {allPins.filter(p => p.allowDownload).length}
                </span>
              </button>

              <button
                onClick={() => setPinDownloadFilter('locked')}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  pinDownloadFilter === 'locked'
                    ? 'bg-rose-600 text-white shadow-rose-600/25 ring-2 ring-rose-400'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100 text-rose-600 dark:text-rose-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa tải</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-black/10 dark:bg-white/10">
                  {allPins.filter(p => !p.allowDownload).length}
                </span>
              </button>
            </div>

            {/* Hàng 2: Nút Thể loại, Sắp xếp, Định dạng - Đặt góc trái & Thu gọn */}
            <div className="flex flex-wrap items-center justify-start gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-fit max-w-full">
              {/* Nút Thể loại */}
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-amber-500" />
                <select
                  value={pinCategoryFilter}
                  onChange={(e) => setPinCategoryFilter(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="all">Thể loại: Tất cả</option>
                  {PIN_CATEGORIES.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>Thể loại: {cat}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Sắp xếp */}
              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-amber-500" />
                <select
                  value={pinSort}
                  onChange={(e) => setPinSort(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="likes">Sắp xếp: Lượt thích nhiều nhất</option>
                  <option value="downloads">Sắp xếp: Lượt tải nhiều nhất</option>
                  <option value="views">Sắp xếp: Lượt xem nhiều nhất</option>
                  <option value="title-asc">Sắp xếp: Tên A → Z</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Định dạng */}
              <div className="relative">
                <ImageIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-amber-500" />
                <select
                  value={pinFormatFilter}
                  onChange={(e) => setPinFormatFilter(e.target.value)}
                  className={`pl-7 pr-7 py-1.5 rounded-xl text-xs font-semibold border shadow-xs appearance-none outline-none cursor-pointer transition-colors ${
                    theme === 'sepia' 
                      ? 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option value="all">Định dạng: Tất cả</option>
                  {PIN_FORMATS.filter(f => f !== 'all').map(fmt => (
                    <option key={fmt} value={fmt}>Định dạng: {fmt}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
              </div>

              {/* Nút Đặt lại nếu đang có lọc */}
              {(pinDownloadFilter !== 'all' || pinCategoryFilter !== 'all' || pinFormatFilter !== 'all' || pinSort !== 'newest') && (
                <button
                  onClick={() => {
                    setPinDownloadFilter('all');
                    setPinCategoryFilter('all');
                    setPinFormatFilter('all');
                    setPinSort('newest');
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: BOOKS GRID */}
        {activeMainTab === 'books' && (
          <div>
            {displayBooks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base">Không tìm thấy sách phù hợp</h3>
                <p className="text-xs opacity-60 mt-1 mb-4">Hãy thử chọn thể loại khác hoặc đặt lại bộ lọc để tiếp tục khám phá!</p>
                <button
                  onClick={() => {
                    setBookTypeFilter('all');
                    setBookCategoryFilter('all');
                    setBookFormatFilter('all');
                    setBookSort('newest');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xem tất cả sách</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {paginatedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onOpenDetail={onOpenBookDetail}
                      onQuickRead={onQuickRead}
                      isMyBook={currentUser && (book.ownerId === currentUser.id || book.ownerUsername === currentUser.username)}
                    />
                  ))}
                </div>

                {/* Phân trang Kho sách (12 sách / trang) */}
                <Pagination
                  currentPage={currentValidBookPage}
                  totalPages={totalBookPages}
                  totalItems={displayBooks.length}
                  itemsPerPage={BOOKS_PER_PAGE}
                  onPageChange={handleBookPageChange}
                  accentColor="emerald"
                  itemLabel="sách"
                />
              </>
            )}
          </div>
        )}

        {/* TAB 2: PINTEREST WATERFALL MASONRY */}
        {activeMainTab === 'pins' && (
          <div className="pt-2">
            {displayPins.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base">Không tìm thấy tác phẩm ảnh phù hợp</h3>
                <p className="text-xs opacity-60 mt-1 mb-4">Hãy thử chuyển sang trạng thái tất cả ảnh hoặc chủ đề khác.</p>
                <button
                  onClick={() => {
                    setPinDownloadFilter('all');
                    setPinCategoryFilter('all');
                    setPinFormatFilter('all');
                    setPinSort('newest');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xem tất cả tranh ảnh</span>
                </button>
              </div>
            ) : (
              <>
                <MasonryGrid
                  pins={paginatedPins}
                  onOpenDetail={onOpenPinDetail}
                  onQuickDownload={onQuickDownload}
                  onLike={onLikePin}
                />

                {/* Phân trang Kho ảnh (20 ảnh / trang) */}
                <Pagination
                  currentPage={currentValidPinPage}
                  totalPages={totalPinPages}
                  totalItems={displayPins.length}
                  itemsPerPage={PINS_PER_PAGE}
                  onPageChange={handlePinPageChange}
                  accentColor="amber"
                  itemLabel="tác phẩm ảnh"
                />
              </>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
