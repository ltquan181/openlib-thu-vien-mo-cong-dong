import React, { useState, useEffect } from 'react';
import { Download, Heart, Eye, Lock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storageService } from '../../services/storageService';

export default function PinCard({ pin, onOpenDetail, onQuickDownload, onLike }) {
  const { currentUser, openAuth } = useAuth();
  const { theme } = useTheme();

  const initiallyLiked = currentUser ? storageService.isPinLiked(currentUser.id, pin.id) : false;
  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(pin.likes || 0);

  useEffect(() => {
    setIsLiked(currentUser ? storageService.isPinLiked(currentUser.id, pin.id) : false);
    setLikesCount(pin.likes || 0);
  }, [currentUser, pin.id, pin.likes]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth('login');
      return;
    }
    const result = onLike ? onLike(pin.id) : null;
    if (result && typeof result.isLiked === 'boolean') {
      setIsLiked(result.isLiked);
      setLikesCount(result.pin.likes);
    } else {
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  let footerBg = 'bg-white border-slate-100 text-slate-800';
  if (theme === 'sepia') {
    footerBg = 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]';
  } else if (theme === 'dark') {
    footerBg = 'bg-[#151C2C] border-[#1E293B] text-slate-200';
  }

  return (
    <div 
      onClick={() => onOpenDetail(pin)}
      className="masonry-item group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-pin hover:shadow-hover-pin transition-all duration-300 cursor-pointer"
    >
      {/* Real Image or SVG Art Display */}
      <div className="w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {pin.imageUrl ? (
          <img
            src={pin.imageUrl}
            alt={pin.title}
            loading="lazy"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div 
            className="w-full h-auto"
            dangerouslySetInnerHTML={{ __html: pin.svgData }}
          />
        )}
      </div>

      {/* Hover Overlay Layer (Classic Pinterest Interaction) */}
      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3.5 flex flex-col justify-between pointer-events-none">
        
        {/* Top Bar: Download Button */}
        <div className="flex justify-end pointer-events-auto">
          {pin.allowDownload ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickDownload(pin);
              }}
              className="py-1.5 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-black/30 transition-transform active:scale-95"
              title="Tải ảnh về máy (−10 điểm)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải (−10đ)</span>
            </button>
          ) : (
            <span className="py-1.5 px-3 rounded-full bg-slate-900/90 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-400/30">
              <Lock className="w-3 h-3" />
              <span>Khóa tải</span>
            </span>
          )}
        </div>

        {/* Bottom Bar: Author info & Heart Reaction */}
        <div className="flex items-center justify-between pointer-events-auto text-white">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 max-w-[70%]">
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {pin.authorUsername ? pin.authorUsername.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium truncate">@{pin.authorUsername}</span>
          </div>

          <button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-md border border-white/20 transition-all ${
              isLiked 
                ? 'bg-rose-500 text-white shadow-rose-500/50' 
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
            title="Thả tim yêu thích"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>

      {/* Persistent Info Footer */}
      <div className={`p-3 border-t flex items-center justify-between text-left transition-colors ${footerBg}`}>
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold truncate leading-snug">{pin.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-semibold opacity-75 truncate">{pin.category}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
              {pin.format || 'JPG'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] opacity-75 shrink-0 ml-2">
          <span className="flex items-center gap-0.5">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{likesCount}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            <span>{pin.views || 0}</span>
          </span>
        </div>
      </div>

    </div>
  );
}
