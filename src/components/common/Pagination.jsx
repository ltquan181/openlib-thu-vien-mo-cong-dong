import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  accentColor = 'emerald', // 'emerald' | 'amber'
  itemLabel = 'mục'
}) {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const isEmerald = accentColor === 'emerald';

  const activeBtnClass = isEmerald
    ? 'bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-700/30 ring-2 ring-emerald-500 scale-105'
    : 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30 ring-2 ring-amber-400 scale-105';

  const defaultBtnClass = theme === 'sepia'
    ? 'bg-[#F4ECD8] text-[#5C4033] hover:bg-[#E8D9BD] border-[#D4C3A3]'
    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700';

  const navBtnBase = "flex items-center justify-center h-9 sm:h-10 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-xs";

  return (
    <div className="mt-10 sm:mt-12 pt-6 pb-2 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Thông tin số lượng hiển thị */}
      <div className="text-xs sm:text-sm opacity-75 font-medium">
        Hiển thị <span className="font-bold font-mono text-slate-900 dark:text-white">{startItem} - {endItem}</span> trên tổng số <span className="font-bold font-mono text-slate-900 dark:text-white">{totalItems}</span> {itemLabel}
      </div>

      {/* Dãy nút chuyển trang */}
      <nav aria-label="Phân trang" className="flex items-center gap-1.5 sm:gap-2">
        {/* Nút về Trang Đầu */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${navBtnBase} ${defaultBtnClass}`}
          title="Trang đầu tiên"
          aria-label="Trang đầu tiên"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Nút Trang Trước */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${navBtnBase} ${defaultBtnClass}`}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline ml-1 text-xs">Trước</span>
        </button>

        {/* Danh sách số trang */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-xs opacity-50 font-bold select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 sm:w-10 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono transition-all duration-150 flex items-center justify-center border active:scale-95 ${
                  isActive ? activeBtnClass : `${defaultBtnClass} hover:scale-105`
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Trang ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Nút Trang Sau */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${navBtnBase} ${defaultBtnClass}`}
          title="Trang tiếp theo"
          aria-label="Trang tiếp theo"
        >
          <span className="hidden md:inline mr-1 text-xs">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Nút đến Trang Cuối */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${navBtnBase} ${defaultBtnClass}`}
          title="Trang cuối cùng"
          aria-label="Trang cuối cùng"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
