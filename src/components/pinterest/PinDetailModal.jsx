import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Heart, 
  Eye, 
  Lock, 
  Unlock, 
  Trash2, 
  User, 
  Calendar, 
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { pinService } from '../../services/pinService';
import { commentService } from '../../services/commentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export default function PinDetailModal({ pin, isOpen, onClose, onPinUpdated }) {
  const { currentUser, openAuth, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (pin) {
      setComments(commentService.getComments(pin.id));
    }
  }, [pin]);

  if (!isOpen || !pin) return null;

  const isAuthor = currentUser && (currentUser.id === pin.authorId || currentUser.username === pin.authorUsername);

  const handleDownload = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    try {
      pinService.downloadPin(pin.id, currentUser);
      refreshUser();
      onPinUpdated();
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } catch {}
      showToast(`Đã tải tác phẩm "${pin.title}" thành công! Đã trừ 10 điểm.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleLock = () => {
    try {
      const updated = pinService.toggleDownloadLock(pin.id, currentUser);
      onPinUpdated();
      showToast(
        updated.allowDownload ? 'Đã mở quyền cho cộng đồng tải ảnh.' : 'Đã khóa quyền tải ảnh.',
        'info'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác phẩm ảnh này khỏi thư viện?')) {
      try {
        pinService.deletePin(pin.id, currentUser);
        onPinUpdated();
        showToast('Đã xóa tác phẩm thành công.', 'info');
        onClose();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const isLiked = currentUser ? storageService.isPinLiked(currentUser.id, pin.id) : false;

  const handleLike = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    const result = pinService.likePin(pin.id, currentUser);
    onPinUpdated();
    if (result && result.isLiked) {
      showToast('Đã thả tim yêu thích tác phẩm ❤️', 'success');
    } else {
      showToast('Đã bỏ yêu thích tác phẩm', 'info');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth('login');
      return;
    }
    try {
      const newCm = commentService.addComment(pin.id, currentUser, newCommentText);
      setComments([newCm, ...comments]);
      setNewCommentText('');
      showToast('Đã gửi bình luận cho tác phẩm!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Theme styling
  let modalBg = 'bg-white text-slate-900 border-slate-200';
  let subBoxBg = 'bg-slate-50 border-slate-200/80';

  if (theme === 'sepia') {
    modalBg = 'bg-[#FAF3E0] text-[#433422] border-[#E8D9BD]';
    subBoxBg = 'bg-[#EFE5CE]/60 border-[#E8D9BD]';
  } else if (theme === 'dark') {
    modalBg = 'bg-[#151C2C] text-slate-100 border-[#1E293B]';
    subBoxBg = 'bg-[#0B0F19] border-[#1E293B]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] ${modalBg}`}>
        
        {/* Left Column: Big Image Display */}
        <div className="md:w-7/12 bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden group">
          {pin.imageUrl ? (
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <div 
              className="w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              dangerouslySetInnerHTML={{ __html: pin.svgData }}
            />
          )}
        </div>

        {/* Right Column: Info & Comments */}
        <div className="md:w-5/12 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto text-left">
          
          <div>
            {/* Top Close & Category */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs font-bold">
                  {pin.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-xs font-mono font-bold">
                  {pin.format || 'JPG'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Description */}
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2">
              {pin.title}
            </h2>
            <p className="text-xs opacity-75 leading-relaxed mb-4">
              {pin.description}
            </p>

            {/* Author Profile Card */}
            <div className={`flex items-center gap-3 p-3 rounded-2xl border mb-4 ${subBoxBg}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                {pin.authorUsername ? pin.authorUsername.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] opacity-60 block font-medium">Tác giả chia sẻ</span>
                <p className="font-bold text-xs truncate">@{pin.authorUsername}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 gap-2 p-3 rounded-2xl border text-center text-xs mb-4 ${subBoxBg}`}>
              <div>
                <span className="text-[10px] opacity-60 block">Lượt xem</span>
                <strong className="text-sm">{pin.views || 0}</strong>
              </div>
              <div className="border-x border-black/10 dark:border-white/10">
                <span className="text-[10px] opacity-60 block">Lượt thích</span>
                <strong className="text-rose-500 text-sm flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current" /> {pin.likes || 0}
                </strong>
              </div>
              <div>
                <span className="text-[10px] opacity-60 block">Tải về</span>
                <strong className="text-indigo-500 text-sm">{pin.downloads || 0}</strong>
              </div>
            </div>

            {/* Comments for Pin */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Bình luận ({comments.length})</span>
              </h4>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Để lại bình luận cho tác phẩm..."
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comments list */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-[11px] opacity-50 py-2 text-center">Chưa có bình luận nào.</p>
                ) : (
                  comments.map((cm) => (
                    <div key={cm.id} className={`p-2.5 rounded-xl border text-xs ${subBoxBg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px]">@{cm.username}</span>
                        <span className="text-[9px] opacity-50 font-mono">
                          {new Date(cm.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="opacity-80 leading-relaxed text-[11px]">{cm.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-black/10 dark:border-white/10">
            {isAuthor ? (
              <div className="flex gap-2">
                <button
                  onClick={handleToggleLock}
                  className="flex-1 py-2.5 px-4 rounded-2xl border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {pin.allowDownload ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span>{pin.allowDownload ? 'Khóa tải ảnh' : 'Mở quyền tải'}</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {pin.allowDownload ? (
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải về máy (−10 điểm)</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-black/10 dark:bg-white/10 opacity-50 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Ảnh bị khóa tải</span>
                  </button>
                )}

                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isLiked
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'border-black/15 dark:border-white/15 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-500'
                  }`}
                  title={isLiked ? 'Bỏ yêu thích' : 'Thả tim yêu thích'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}

            <p className="text-[10px] opacity-60 text-center">
              Mỗi lượt tải: Người tải −10đ · Người sáng tạo nhận +5đ
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
