import React, { useState, useRef, useEffect } from 'react';
import { 
  Library, 
  Search, 
  Coins, 
  Bell, 
  User, 
  ChevronDown, 
  BookOpen, 
  Image as ImageIcon, 
  ShoppingBag, 
  Award, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus,
  Clock,
  AlertTriangle,
  BookmarkCheck,
  Check,
  X,
  Sun,
  Scroll,
  Moon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { storageService } from '../../services/storageService';
import CatBookLogo from './CatBookLogo';

export default function Navbar({ activeRoute, onNavigate, onOpenBookDetail, onOpenPinDetail }) {
  const { currentUser, logout, openAuth } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markNotificationAsRead } = useNotification();
  const { theme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNotificationClick = (n) => {
    if (markNotificationAsRead) markNotificationAsRead(n.id);
    setIsBellOpen(false);
    if (n.txId) {
      onNavigate(`#/transactions?tab=${n.targetTab || 'active'}&tx=${n.txId}`);
    } else {
      onNavigate('#/transactions');
    }
  };

  const searchRef = useRef(null);
  const bellRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const books = storageService.getBooks();
  const pins = storageService.getPins();

  const query = searchQuery.trim().toLowerCase();
  const matchedBooks = query
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          (b.category && b.category.toLowerCase().includes(query)) ||
          (b.format && b.format.toLowerCase().includes(query)) ||
          b.ownerUsername.toLowerCase().includes(query)
      ).slice(0, 4)
    : [];

  const matchedPins = query
    ? pins.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.format && p.format.toLowerCase().includes(query)) ||
          p.authorUsername.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  // Theme styling for Navbar & High-Contrast Components
  let navBg = 'bg-white/95 border-slate-200 text-slate-900 shadow-sm';
  let inputBg = 'bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20';
  let searchIconColor = 'text-slate-500';
  let searchDropdownBg = 'bg-white border-slate-300 text-slate-900 ring-1 ring-black/5 shadow-2xl';
  let searchItemHover = 'hover:bg-emerald-50/70';

  let userBtnBg = 'bg-slate-100 hover:bg-slate-200/90 border-slate-300 text-slate-800 shadow-xs';
  let bellBtnBg = 'bg-slate-100 hover:bg-slate-200/90 border-slate-300 text-slate-700 shadow-xs';
  let userDropdownBg = 'bg-white border-slate-300 text-slate-800 ring-1 ring-black/5 shadow-2xl';
  let userProfileBg = 'bg-gradient-to-br from-emerald-800 to-teal-950 text-white border border-emerald-900/40 shadow-sm';
  let menuItemHover = 'hover:bg-slate-100 text-slate-700 hover:text-slate-900';
  let themeBoxBg = 'bg-slate-100/90 border-slate-300 text-slate-700';
  let themeBtnInactive = 'opacity-70 hover:opacity-100 hover:bg-white/90 text-slate-700';
  let dividerBorder = 'border-slate-200';
  let notifDropdownBg = 'bg-white border-slate-300 text-slate-900 ring-1 ring-black/5 shadow-2xl';
  let notifHeaderBorder = 'border-slate-200';
  let notifItemHover = 'hover:bg-emerald-50/60';

  if (theme === 'sepia') {
    navBg = 'bg-[#FAF3E0]/95 border-[#E2D2B5] text-[#362716] shadow-sm';
    inputBg = 'bg-[#E8DAC0] hover:bg-[#E2D3B7] focus:bg-[#FFFDF9] text-[#362716] placeholder-[#826C54] border-[#CDB993] focus:border-amber-700 focus:ring-4 focus:ring-amber-600/25';
    searchIconColor = 'text-[#7D6448]';
    searchDropdownBg = 'bg-[#FAF3E0] border-[#CDB993] text-[#362716] ring-1 ring-amber-900/15 shadow-2xl';
    searchItemHover = 'hover:bg-[#EFE5CE]';

    userBtnBg = 'bg-[#E8DAC0] hover:bg-[#DDD0B4] border-[#CDB993] text-[#362716] shadow-xs';
    bellBtnBg = 'bg-[#E8DAC0] hover:bg-[#DDD0B4] border-[#CDB993] text-[#362716] shadow-xs';
    userDropdownBg = 'bg-[#FBF6EA] border-[#CDB993] text-[#362716] ring-1 ring-amber-900/15 shadow-2xl';
    userProfileBg = 'bg-gradient-to-br from-[#4A3B2C] to-[#2B1F14] text-[#FAF3E0] border border-[#7D6448]/40 shadow-sm';
    menuItemHover = 'hover:bg-[#EFE5CE] text-[#362716] hover:text-[#1A120B]';
    themeBoxBg = 'bg-[#E8DAC0] border-[#CDB993] text-[#362716]';
    themeBtnInactive = 'opacity-70 hover:opacity-100 hover:bg-[#FAF3E0] text-[#5A4632]';
    dividerBorder = 'border-[#CDB993]';
    notifDropdownBg = 'bg-[#FBF6EA] border-[#CDB993] text-[#362716] ring-1 ring-amber-900/15 shadow-2xl';
    notifHeaderBorder = 'border-[#E2D2B5]';
    notifItemHover = 'hover:bg-[#EFE5CE]';
  } else if (theme === 'dark') {
    navBg = 'bg-[#0F172A]/95 border-slate-800 text-slate-100 shadow-md';
    inputBg = 'bg-[#1E293B] hover:bg-[#25334A] focus:bg-[#0F172A] text-slate-100 placeholder-slate-400 border-slate-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/25';
    searchIconColor = 'text-slate-400';
    searchDropdownBg = 'bg-[#131C2E] border-slate-700 text-slate-100 ring-1 ring-white/10 shadow-2xl';
    searchItemHover = 'hover:bg-slate-800/80';

    userBtnBg = 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-100 shadow-xs';
    bellBtnBg = 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-xs';
    userDropdownBg = 'bg-[#131C2E] border-slate-700 text-slate-100 ring-1 ring-white/10 shadow-2xl';
    userProfileBg = 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-slate-700 shadow-sm';
    menuItemHover = 'hover:bg-slate-800/80 text-slate-200 hover:text-white';
    themeBoxBg = 'bg-slate-900/90 border-slate-700 text-slate-300';
    themeBtnInactive = 'opacity-70 hover:opacity-100 hover:bg-slate-800 text-slate-300';
    dividerBorder = 'border-slate-700';
    notifDropdownBg = 'bg-[#131C2E] border-slate-700 text-slate-100 ring-1 ring-white/10 shadow-2xl';
    notifHeaderBorder = 'border-slate-700';
    notifItemHover = 'hover:bg-slate-800/80';
  }

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Big Main Logo (OpenLib THƯ VIỆN MỞ CỘNG ĐỒNG) */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (window.location.hash !== '#/community') {
                window.location.hash = '#/community';
              }
              window.location.reload();
            }}
            title="OpenLib - Về trang chủ & Làm mới trang (F5)"
            className="flex items-center gap-3 transition-transform hover:scale-[1.02] text-left group cursor-pointer"
          >
            {/* Logo Icon Mèo Chồng Sách */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/15 via-emerald-400/10 to-amber-500/15 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-700/10 group-hover:shadow-emerald-700/25 group-hover:scale-105 transition-all shrink-0 p-1">
              <CatBookLogo className="w-full h-full" />
            </div>

            {/* Logo Titles */}
            <div className="text-left">
              <span className="font-black text-2xl sm:text-3xl tracking-tight font-sans text-slate-900 dark:text-white flex items-center">
                Open<span className="text-emerald-600 dark:text-emerald-400">Lib</span>
              </span>
              <span className="block text-[10px] sm:text-[11px] font-black text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
                THƯ VIỆN MỞ CỘNG ĐỒNG
              </span>
            </div>
          </button>
        </div>

        {/* Center: Lengthened Search Bar extending close to Logo */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl sm:max-w-3xl ml-1 sm:ml-4">
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${searchIconColor}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm kiếm sách, tác giả, thể loại, tranh ảnh minh họa..."
              className={`w-full pl-11 pr-10 py-2.5 rounded-full text-xs sm:text-sm font-medium border outline-none transition-all shadow-xs ${inputBg}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-0.5 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 p-3 max-h-[75vh] overflow-y-auto ${searchDropdownBg}`}>
              {matchedBooks.length === 0 && matchedPins.length === 0 ? (
                <div className="py-6 text-center text-xs opacity-60 font-medium">
                  Không tìm thấy kết quả phù hợp cho "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedBooks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Sách trong kho ({matchedBooks.length})</span>
                      </div>
                      <div className="space-y-1">
                        {matchedBooks.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              onOpenBookDetail(b);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors group ${searchItemHover}`}
                          >
                            <div className="flex items-center gap-3">
                              {b.coverImage ? (
                                <img src={b.coverImage} alt={b.title} className="w-8 h-11 object-cover rounded shadow-xs shrink-0" />
                              ) : (
                                <div className="w-8 h-11 rounded bg-emerald-900 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {b.format}
                                </div>
                              )}
                              <div className="text-left">
                                <p className="text-xs font-semibold group-hover:text-emerald-600 line-clamp-1">{b.title}</p>
                                <p className="text-[11px] opacity-70">{b.author} · @{b.ownerUsername}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full shrink-0">
                              {b.type === 'exchange' ? 'Trao đổi' : 'Cho mượn'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedPins.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider px-2 mb-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Tranh ảnh minh họa ({matchedPins.length})</span>
                      </div>
                      <div className="space-y-1">
                        {matchedPins.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              onOpenPinDetail(p);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors group ${searchItemHover}`}
                          >
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.title} className="w-8 h-8 object-cover rounded-lg shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                                  🎨
                                </div>
                              )}
                              <div className="text-left">
                                <p className="text-xs font-semibold group-hover:text-amber-500 line-clamp-1">{p.title}</p>
                                <p className="text-[11px] opacity-70">{p.category} · @{p.authorUsername}</p>
                              </div>
                            </div>
                            <span className="text-[10px] opacity-70 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                              {p.allowDownload ? 'Cho tải' : 'Khóa tải'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Only Notification Bell and User Avatar (Clean Header) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => setIsBellOpen(!isBellOpen)}
                  className={`relative p-2.5 rounded-full border transition-all ${bellBtnBg}`}
                  aria-label="Thông báo"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isBellOpen && (
                  <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-slide-up ${notifDropdownBg}`}>
                    <div className={`p-3.5 border-b flex items-center justify-between ${notifHeaderBorder}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">Thông báo cộng đồng</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Đã đọc tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs opacity-50">
                          Bạn chưa có thông báo mới nào
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${notifItemHover} ${
                              !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                            }`}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group-hover:border-emerald-500 transition-colors">
                              <Clock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">{n.title}</p>
                                <span className="text-[10px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                  Xem <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                              <p className="text-[11px] opacity-75 mt-0.5 leading-relaxed">{n.message}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] opacity-50 font-mono">{n.date}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
                                  Kiểm tra trong Giỏ sách cộng đồng →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu Avatar & Comprehensive Dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border transition-all ${userBtnBg}`}
                >
                  <div className={`w-8 h-8 rounded-full ${currentUser.avatarBg || 'bg-emerald-700'} text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0`}>
                    {currentUser.avatarText || currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold hidden md:block max-w-[110px] truncate">
                    {currentUser.displayName || currentUser.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
                </button>

                {/* User Dropdown with Requested Structure */}
                {isUserMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-3xl border shadow-2xl p-2.5 z-50 animate-slide-up ${userDropdownBg}`}>
                    
                    {/* User Profile Card */}
                    <div className={`p-3.5 rounded-2xl mb-2 flex items-center gap-3 ${userProfileBg}`}>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                        {currentUser.avatarText || currentUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden text-left flex-1">
                        <p className="font-bold text-xs truncate">{currentUser.displayName || currentUser.username}</p>
                        <p className="text-[10px] opacity-80 truncate">{currentUser.email}</p>
                        <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs">
                          ⭐ {currentUser.points ?? 0} điểm
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      
                      {/* 1. Điểm cộng đồng */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onNavigate('#/points'); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${menuItemHover}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-amber-600 dark:text-amber-400">Điểm cộng đồng</span>
                        </div>
                        <span className={`font-extrabold text-[11px] px-2.5 py-0.5 rounded-full ${
                          theme === 'sepia'
                            ? 'bg-[#E8DAC0] text-amber-950 border border-[#CDB993]'
                            : theme === 'dark'
                              ? 'bg-amber-950/80 text-amber-200 border border-amber-800/50'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {currentUser.points ?? 0}đ
                        </span>
                      </button>

                      {/* 2. Giỏ sách cộng đồng (đặt lại nằm giữa Điểm cộng đồng và Thư viện của tôi) */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onNavigate('#/transactions'); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left font-medium ${menuItemHover}`}
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Giỏ sách cộng đồng</span>
                      </button>

                      {/* 3. Thư viện cộng đồng (quay trở lại trang chủ, nằm giữa Giỏ sách cộng đồng và Thư viện của tôi) */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onNavigate('#/community'); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left font-medium ${menuItemHover}`}
                      >
                        <Library className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Thư viện cộng đồng</span>
                      </button>

                      {/* 4. Thư viện của tôi (gộp Kho sách và Kho ảnh) */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onNavigate('#/my-library'); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-colors text-left border ${
                          theme === 'sepia'
                            ? 'bg-[#E8DAC0]/70 hover:bg-[#E0CFB3] text-[#2B1F14] border-[#CDB993]'
                            : theme === 'dark'
                              ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/50'
                              : 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Thư viện của tôi</span>
                      </button>

                      {/* 5. Chế độ giao diện (Thu gọn, chỉ hiển thị Icon, hover hiển thị Sáng, Tối, Đọc sách) */}
                      <div className="pt-2 pb-1 px-1">
                        <div className={`flex items-center justify-between px-3 py-2 rounded-2xl border ${themeBoxBg}`}>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-left opacity-80">
                            Giao diện
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Nút Sáng */}
                            <div className="relative group flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setTheme('light')}
                                title="Sáng"
                                aria-label="Giao diện Sáng"
                                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                                  theme === 'light'
                                    ? 'bg-white text-amber-500 shadow-sm ring-1 ring-slate-300 font-bold'
                                    : themeBtnInactive
                                }`}
                              >
                                <Sun className="w-4 h-4" />
                              </button>
                              {/* Hover Tooltip: Sáng */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-md whitespace-nowrap">
                                  Sáng
                                </span>
                                <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-0.5"></div>
                              </div>
                            </div>

                            {/* Nút Tối */}
                            <div className="relative group flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                title="Tối"
                                aria-label="Giao diện Tối"
                                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                                  theme === 'dark'
                                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 font-bold'
                                    : themeBtnInactive
                                }`}
                              >
                                <Moon className="w-4 h-4" />
                              </button>
                              {/* Hover Tooltip: Tối */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-md whitespace-nowrap">
                                  Tối
                                </span>
                                <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-0.5"></div>
                              </div>
                            </div>

                            {/* Nút Đọc sách */}
                            <div className="relative group flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setTheme('sepia')}
                                title="Đọc sách"
                                aria-label="Giao diện Đọc sách"
                                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                                  theme === 'sepia'
                                    ? 'bg-[#FAF3E0] text-amber-900 shadow-sm ring-1 ring-amber-600/50 font-bold'
                                    : themeBtnInactive
                                }`}
                              >
                                <Scroll className="w-4 h-4" />
                              </button>
                              {/* Hover Tooltip: Đọc sách */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-md whitespace-nowrap">
                                  Đọc sách
                                </span>
                                <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-0.5"></div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      <hr className={`my-1.5 border-t ${dividerBorder}`} />

                      {/* 6. Thay đổi thông tin */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onNavigate('#/profile'); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left font-medium ${menuItemHover}`}
                      >
                        <Settings className="w-4 h-4 opacity-75 shrink-0" />
                        <span>Thay đổi thông tin</span>
                      </button>

                      {/* 7. Đăng xuất */}
                      <button
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left font-semibold ${
                          theme === 'sepia'
                            ? 'hover:bg-rose-100/60 text-rose-800'
                            : theme === 'dark'
                              ? 'hover:bg-rose-950/40 text-rose-400'
                              : 'hover:bg-rose-50 text-rose-600'
                        }`}
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Đăng xuất</span>
                      </button>

                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
              <button
                onClick={() => openAuth('register')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký (+100đ)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
