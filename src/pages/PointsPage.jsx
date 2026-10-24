import React from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ArrowLeftRight, 
  BookmarkCheck, 
  Award, 
  ShieldAlert,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';

export default function PointsPage() {
  const { currentUser, openAuth } = useAuth();
  const { theme } = useTheme();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs opacity-60 mb-6">Bạn cần đăng nhập để xem thông tin điểm cộng đồng và lịch sử tích điểm.</p>
        <button
          onClick={() => openAuth('login')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-700 text-white font-bold text-xs"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const allLogs = storageService.getPointsHistory();
  const myLogs = allLogs.filter((l) => l.userId === currentUser.id);

  // Stats calculation
  const totalEarned = myLogs
    .filter((l) => l.points > 0)
    .reduce((sum, l) => sum + l.points, 0);

  const totalSpent = myLogs
    .filter((l) => l.points < 0)
    .reduce((sum, l) => sum + Math.abs(l.points), 0);

  let cardBg = 'bg-white border-slate-200/90 text-slate-800';
  if (theme === 'sepia') {
    cardBg = 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]';
  } else if (theme === 'dark') {
    cardBg = 'bg-[#151C2C] border-[#1E293B] text-slate-100';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-black/10 dark:border-white/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-500" />
          <span>Điểm cộng đồng</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-60 mt-1">
          Hệ thống điểm thưởng khích lệ chia sẻ tri thức và xây dựng cộng đồng bạn đọc văn minh, uy tín.
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Current Points */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Số dư khả dụng</span>
            <Coins className="w-5 h-5 text-slate-950" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {currentUser.points ?? 0}<span className="text-lg font-bold ml-1">đ</span>
          </p>
          <span className="text-[11px] font-medium opacity-85 mt-1 block">Dùng để mượn sách & tải ảnh</span>
        </div>

        {/* Total Earned */}
        <div className={`p-5 rounded-3xl border shadow-xs ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Tổng điểm nhận</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            +{totalEarned}<span className="text-base font-bold ml-1">đ</span>
          </p>
          <span className="text-[11px] opacity-60 mt-1 block">Từ đăng sách, cho mượn, đăng ảnh</span>
        </div>

        {/* Total Spent */}
        <div className={`p-5 rounded-3xl border shadow-xs ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Tổng điểm đã chi</span>
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 tracking-tight">
            −{totalSpent}<span className="text-base font-bold ml-1">đ</span>
          </p>
          <span className="text-[11px] opacity-60 mt-1 block">Mượn sách & tải tác phẩm</span>
        </div>

        {/* Violations Count */}
        <div className={`p-5 rounded-3xl border shadow-xs ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Vi phạm</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {currentUser.violations || 0} / 3
          </p>
          <span className="text-[11px] opacity-60 mt-1 block">Đạt 3 lần sẽ bị khóa mượn/đổi</span>
        </div>

      </div>

      {/* Point Rules Summary Box (Updated Rules) */}
      <div className={`p-5 rounded-3xl border mb-8 ${
        theme === 'sepia' ? 'bg-[#EFE5CE]/60 border-[#E8D9BD]' : theme === 'dark' ? 'bg-[#151C2C] border-[#1E293B]' : 'bg-emerald-50/70 border-emerald-200/80'
      }`}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-950 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Quy tắc vận hành Điểm cộng đồng OpenLib</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs leading-relaxed">
          <div className={`p-3.5 rounded-2xl border shadow-xs ${cardBg}`}>
            <strong className="block text-emerald-700 dark:text-emerald-300 font-bold mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đăng sách mới</span>
            </strong>
            <span>Nhận ngay <strong>+15 điểm</strong> cho mỗi đầu sách chia sẻ lên thư viện cộng đồng.</span>
          </div>

          <div className={`p-3.5 rounded-2xl border shadow-xs ${cardBg}`}>
            <strong className="block text-cyan-700 dark:text-cyan-300 font-bold mb-1 flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Mượn sách</span>
            </strong>
            <span>Người mượn <strong>−10 điểm</strong>, chủ sách nhận <strong>+10 điểm</strong>. Hạn mượn: 7 ngày.</span>
          </div>

          <div className={`p-3.5 rounded-2xl border shadow-xs ${cardBg}`}>
            <strong className="block text-purple-700 dark:text-purple-300 font-bold mb-1 flex items-center gap-1">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Trao đổi P2P</span>
            </strong>
            <span>Khi duyệt đề nghị trao đổi, cả 2 bên mỗi người cùng được <strong>+5 điểm</strong>. Hạn trả: 14 ngày.</span>
          </div>

          <div className={`p-3.5 rounded-2xl border shadow-xs ${cardBg}`}>
            <strong className="block text-amber-700 dark:text-amber-300 font-bold mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Kho ảnh</span>
            </strong>
            <span>Đăng ảnh: <strong>+15đ</strong>. Mỗi lượt tải: người tải <strong>−10đ</strong>, tác giả nhận <strong>+5đ</strong>.</span>
          </div>
        </div>
      </div>

      {/* Transaction History Log Table */}
      <div className={`rounded-3xl border shadow-xs overflow-hidden ${cardBg}`}>
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-sm">Lịch sử biến động điểm</h3>
          <span className="text-xs opacity-60 font-mono">{myLogs.length} giao dịch</span>
        </div>

        {myLogs.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-50">
            Chưa có lịch sử giao dịch điểm nào.
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {myLogs.map((log) => {
              const isPositive = log.points > 0;
              return (
                <div key={log.id} className="p-4 sm:px-6 flex items-center justify-between text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {isPositive ? '+' : '−'}
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">{log.title}</p>
                      <span className="text-[10px] opacity-50 font-mono">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <span className={`font-extrabold text-sm sm:text-base ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPositive ? `+${log.points}` : log.points}đ
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
