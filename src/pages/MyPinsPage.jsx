import React from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Lock, 
  Unlock, 
  Trash2, 
  Heart, 
  Eye, 
  Download 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';
import PinCard from '../components/pinterest/PinCard';

export default function MyPinsPage({ onOpenPinDetail, onQuickDownload, onLikePin, onOpenAddPin }) {
  const { currentUser, openAuth } = useAuth();
  const { theme } = useTheme();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs opacity-60 mb-6">Bạn cần đăng nhập để quản lý Kho ảnh nghệ thuật của riêng mình.</p>
        <button
          onClick={() => openAuth('login')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const allPins = storageService.getPins();
  const myPins = allPins.filter(
    (p) => p.authorId === currentUser.id || p.authorUsername === currentUser.username
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-black/10 dark:border-white/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          <span>Kho ảnh của tôi</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-60 mt-1">
          Quản lý và theo dõi các tác phẩm ảnh nghệ thuật, tranh minh họa mà bạn đã chia sẻ với cộng đồng.
        </p>
      </div>

      {/* Pins List */}
      <div>
        {myPins.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs opacity-60 font-medium">Các tác phẩm tranh ảnh bạn đã ghim ({myPins.length}):</span>
            <button
              onClick={onOpenAddPin}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng ảnh mới (+15đ)</span>
            </button>
          </div>
        )}
        {myPins.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base mb-1">Bạn chưa chia sẻ tác phẩm ảnh nào</h3>
            <p className="text-xs opacity-60 mb-5">Đăng ảnh lên để nhận ngay 15 điểm và nhận thêm 5 điểm mỗi lượt có bạn đọc tải về!</p>
            <button
              onClick={onOpenAddPin}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng ảnh mới (+15đ)</span>
            </button>
          </div>
        ) : (
          <div className="masonry-grid w-full">
            {myPins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onOpenDetail={onOpenPinDetail}
                onQuickDownload={onQuickDownload}
                onLike={onLikePin}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
