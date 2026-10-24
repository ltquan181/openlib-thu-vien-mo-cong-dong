import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowLeftRight, 
  BookmarkCheck, 
  Eye, 
  UserCheck,
  Star
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function BookCard({ book, onOpenDetail, onQuickRead, isMyBook = false }) {
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);

  // Theme card colors
  let cardBg = 'bg-white border-slate-200/90 text-slate-900';
  let footerBorder = 'border-slate-100';

  if (theme === 'sepia') {
    cardBg = 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]';
    footerBorder = 'border-[#E8D9BD]/60';
  } else if (theme === 'dark') {
    cardBg = 'bg-[#151C2C] border-[#1E293B] text-slate-200';
    footerBorder = 'border-[#1E293B]';
  }

  return (
    <div className={`group relative rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden ${cardBg}`}>
      
      {/* Book Cover Area */}
      <div className="relative h-64 bg-slate-900 overflow-hidden book-spine-effect flex items-center justify-center">
        
        {/* Real Cover Image or Fallback */}
        {book.coverImage && !imgError ? (
          <img
            src={book.coverImage}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${book.coverBg || 'from-indigo-900 to-slate-900'} p-4 flex flex-col justify-between text-white`}>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 text-[10px] font-mono font-bold">
                {book.format}
              </span>
            </div>
            <div className="text-center my-auto">
              <BookOpen className="w-10 h-10 mx-auto text-amber-300 mb-2 opacity-90" />
              <h4 className="font-serif font-bold text-sm line-clamp-3">{book.title}</h4>
            </div>
            <div className="text-center text-slate-300 text-[10px] truncate">{book.author}</div>
          </div>
        )}

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md ${
              book.type === 'exchange'
                ? 'bg-purple-900/85 text-purple-200 border border-purple-500/40'
                : 'bg-cyan-900/85 text-cyan-200 border border-cyan-500/40'
            }`}>
              {book.type === 'exchange' ? (
                <>
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Trao đổi</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-3 h-3" />
                  <span>Cho mượn</span>
                </>
              )}
            </span>

            {isMyBook && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/90 text-emerald-200 border border-emerald-500/40 shadow-md backdrop-blur-md">
                Sách của tôi
              </span>
            )}
          </div>

          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
            {book.format}
          </span>
        </div>

        {/* Hover Quick Action Buttons - Chỉ giữ lại Xem chi tiết theo yêu cầu */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 z-20">
          <button
            onClick={() => onOpenDetail(book)}
            className="w-full py-2.5 px-3 rounded-xl bg-white/95 hover:bg-white text-indigo-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>

      {/* Book Metadata & Info Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 truncate">
              {book.category || 'Văn học'}
            </span>
            <span className="text-[10px] opacity-60 font-mono">{book.publishYear}</span>
          </div>

          <h3 
            onClick={() => onOpenDetail(book)}
            className="font-bold text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
          >
            {book.title}
          </h3>

          <p className="text-[11px] opacity-75 truncate mb-2">{book.author}</p>
        </div>

        <div>
          {/* Owner user tag */}
          <div className={`flex items-center gap-1.5 text-[11px] py-1.5 border-t ${footerBorder}`}>
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate opacity-80">Sở hữu: <strong className="font-semibold">@{book.ownerUsername}</strong></span>
          </div>

          {/* Footer Points indicator */}
          <div className={`flex items-center justify-between text-xs pt-1.5 border-t ${footerBorder}`}>
            <span className="text-[10px] opacity-70">{book.language}</span>
            <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
              book.type === 'exchange'
                ? 'bg-purple-100/70 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                : 'bg-cyan-100/70 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300'
            }`}>
              {book.pointsRule}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
