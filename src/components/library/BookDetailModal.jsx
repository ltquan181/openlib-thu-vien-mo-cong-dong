import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  ArrowLeftRight, 
  BookmarkCheck, 
  Download, 
  Eye, 
  EyeOff, 
  FileText, 
  User, 
  Languages, 
  Building2, 
  Calendar,
  Star,
  MessageSquare,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { bookService } from '../../services/bookService';
import { commentService } from '../../services/commentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { getAssetUrl } from '../../utils/assetHelper';
import confetti from 'canvas-confetti';

export default function BookDetailModal({ book, isOpen, onClose, onReadOnline, onBookUpdated }) {
  const { currentUser, openAuth, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'comments'
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isExchangeSelectOpen, setIsExchangeSelectOpen] = useState(false);
  const [selectedMyBookId, setSelectedMyBookId] = useState('');

  useEffect(() => {
    if (book) {
      setComments(commentService.getComments(book.id));
      setActiveTab('info');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const isMyBook = currentUser && (currentUser.id === book.ownerId || currentUser.username === book.ownerUsername);
  const isAvailable = book.status === 'available';

  // Check if current user already has active borrow or exchange transaction for this book
  const activeTxs = storageService.getTransactions();
  const isAlreadyBorrowedByMe = currentUser && activeTxs.some(t => {
    if (t.status !== 'active') return false;
    if (t.type === 'borrow') {
      return t.bookId === book.id && (t.borrowerId === currentUser.id || t.borrowerUsername === currentUser.username);
    }
    if (t.type === 'exchange') {
      const isUserA = t.ownerA_Id === currentUser.id || t.ownerA_Username === currentUser.username;
      const isUserB = t.ownerB_Id === currentUser.id || t.ownerB_Username === currentUser.username;
      return (isUserA && t.bookIdB === book.id) || (isUserB && t.bookIdA === book.id);
    }
    return false;
  });

  const hasReadingAccess = isMyBook || isAlreadyBorrowedByMe;

  const myAvailableBooks = currentUser
    ? bookService.getBooks().filter(b => (b.ownerId === currentUser.id || b.ownerUsername === currentUser.username) && b.status === 'available')
    : [];

  const handleBorrow = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    try {
      bookService.borrowBook(book.id, currentUser);
      refreshUser();
      onBookUpdated();
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch {}
      showToast(`Mượn sách "${book.title}" thành công! Đã trừ 10 điểm. Hạn trả 7 ngày.`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReadOnline = () => {
    onClose();
    onReadOnline(book);
  };

  const handleExchangeRequest = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    if (myAvailableBooks.length === 0) {
      showToast('Bạn chưa có cuốn sách nào ở trạng thái sẵn sàng để trao đổi!', 'warning');
      return;
    }
    setIsExchangeSelectOpen(true);
  };

  const handleConfirmExchange = () => {
    if (!selectedMyBookId) {
      showToast('Vui lòng chọn 1 cuốn sách của bạn để gửi đề nghị trao đổi.', 'warning');
      return;
    }
    try {
      bookService.requestExchange(selectedMyBookId, book.id, currentUser);
      showToast(`Đã gửi đề nghị đổi sách tới @${book.ownerUsername}!`, 'success');
      setIsExchangeSelectOpen(false);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleHide = () => {
    try {
      const updated = bookService.toggleBookVisibility(book.id, currentUser);
      onBookUpdated();
      showToast(
        updated.status === 'hidden' ? 'Đã tạm ẩn sách khỏi tủ sách cộng đồng.' : 'Đã hiển thị lại sách lên cộng đồng.',
        'info'
      );
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth('login');
      return;
    }
    try {
      const newCm = commentService.addComment(book.id, currentUser, newCommentText, newRating);
      setComments([newCm, ...comments]);
      setNewCommentText('');
      showToast('Đã đăng bình luận đánh giá thành công!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Theme styling
  let modalBg = 'bg-white text-slate-900 border-slate-200';
  let modalFooterBg = 'bg-slate-50 border-slate-100';
  let subBoxBg = 'bg-slate-50 border-slate-200/80';

  if (theme === 'sepia') {
    modalBg = 'bg-[#FAF3E0] text-[#433422] border-[#E8D9BD]';
    modalFooterBg = 'bg-[#EFE5CE] border-[#E8D9BD]';
    subBoxBg = 'bg-[#EFE5CE]/60 border-[#E8D9BD]';
  } else if (theme === 'dark') {
    modalBg = 'bg-[#151C2C] text-slate-100 border-[#1E293B]';
    modalFooterBg = 'bg-[#0F172A] border-[#1E293B]';
    subBoxBg = 'bg-[#0B0F19] border-[#1E293B]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${modalBg}`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              book.type === 'exchange' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
            }`}>
              {book.type === 'exchange' ? 'Trao đổi P2P' : 'Cho mượn'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {book.category || 'Văn học'}
            </span>
            {isMyBook && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Sách của bạn
              </span>
            )}
            {isAlreadyBorrowedByMe && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Bạn đang mượn
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs inside Modal (Thông tin sách / Bình luận) */}
        <div className="flex border-b border-black/10 dark:border-white/10 px-6 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thông tin tác phẩm</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Bình luận & Đánh giá ({comments.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          
          {/* TAB 1: BOOK INFO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Cover (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-xl book-spine-effect mb-4 bg-slate-900 flex items-center justify-center">
                  {book.coverImage ? (
                    <img 
                      src={getAssetUrl(book.coverImage)} 
                      alt={book.title} 
                      className="w-full h-full object-cover object-center" 
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${book.coverBg || 'from-indigo-900 to-slate-900'} p-4 flex flex-col justify-between text-white text-center`}>
                      <BookOpen className="w-10 h-10 mx-auto text-amber-300 my-auto" />
                      <h4 className="font-serif font-bold text-sm">{book.title}</h4>
                    </div>
                  )}
                </div>

                <div className={`w-full p-3 rounded-2xl border text-xs space-y-1 ${subBoxBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">Định dạng:</span>
                    <strong>{book.format}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">Dung lượng:</span>
                    <strong>{book.fileSize}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">Hạn mượn:</span>
                    <strong>{book.type === 'exchange' ? '14 ngày' : '7 ngày'}</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Summary (8 cols) */}
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-snug mb-1">{book.title}</h2>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{book.author}</p>

                  {/* Metadata Grid */}
                  <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border mb-4 text-xs ${subBoxBg}`}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 opacity-50 shrink-0" />
                      <div>
                        <span className="opacity-60 block text-[10px]">Người chia sẻ</span>
                        <strong>@{book.ownerUsername}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 opacity-50 shrink-0" />
                      <div>
                        <span className="opacity-60 block text-[10px]">Ngôn ngữ</span>
                        <strong>{book.language}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 opacity-50 shrink-0" />
                      <div>
                        <span className="opacity-60 block text-[10px]">Nhà xuất bản</span>
                        <strong className="truncate block max-w-[120px]">{book.publisher}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-50 shrink-0" />
                      <div>
                        <span className="opacity-60 block text-[10px]">Năm xuất bản</span>
                        <strong>{book.publishYear}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1.5">Tóm tắt nội dung</h4>
                    <p className="text-xs opacity-80 leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {book.description}
                    </p>
                  </div>

                  {/* Exchange Select Box if open */}
                  {isExchangeSelectOpen && (
                    <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 mb-4 animate-slide-up">
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-2">Chọn 1 cuốn sách từ tủ sách của bạn:</h4>
                      <select
                        value={selectedMyBookId}
                        onChange={(e) => setSelectedMyBookId(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 mb-2"
                      >
                        <option value="">-- Chọn sách bạn muốn đổi --</option>
                        {myAvailableBooks.map((b) => (
                          <option key={b.id} value={b.id}>{b.title} ({b.format})</option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsExchangeSelectOpen(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium opacity-70 hover:opacity-100"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleConfirmExchange}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-700 text-white hover:bg-purple-800"
                        >
                          Gửi đề nghị (+5đ khi duyệt)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Points notice */}
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <span>{book.type === 'exchange' ? '🔄 Trao đổi: Cả 2 bên được cộng +5đ khi duyệt.' : '📖 Mượn sách: Người mượn −10đ, chủ sách nhận +10đ.'}</span>
                  <strong className="text-amber-600 font-bold ml-2 shrink-0">{book.pointsRule}</strong>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: COMMENTS & REVIEWS */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              
              {/* Comment Input Form */}
              <form onSubmit={handleAddComment} className={`p-4 rounded-2xl border ${subBoxBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Viết cảm nhận của bạn:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current' : 'opacity-30'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Chia sẻ đánh giá, suy nghĩ của bạn về cuốn sách này..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-xs opacity-50">
                    Chưa có bình luận nào cho cuốn sách này. Hãy là người đầu tiên chia sẻ cảm nhận!
                  </div>
                ) : (
                  comments.map((cm) => (
                    <div key={cm.id} className={`p-3.5 rounded-2xl border ${subBoxBg}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${cm.avatarBg || 'bg-indigo-600'} text-white flex items-center justify-center text-[10px] font-bold`}>
                            {cm.avatarText || cm.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold">@{cm.username}</span>
                          <div className="flex items-center text-amber-400 text-[10px]">
                            {Array.from({ length: cm.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] opacity-50 font-mono">
                          {new Date(cm.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs opacity-85 leading-relaxed pl-8">{cm.content}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Action Bar */}
        <div className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${modalFooterBg}`}>
          
          <div className="flex items-center gap-2">
            {/* Chỉ hiển thị nút Đọc sách khi ĐÃ mượn, ĐÃ trao đổi hoặc là sách của chính mình */}
            {hasReadingAccess && (
              <button
                onClick={handleReadOnline}
                className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Đọc sách ngay</span>
              </button>
            )}

            {isMyBook && (
              <button
                onClick={handleToggleHide}
                className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {book.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{book.status === 'hidden' ? 'Bật hiển thị sách' : 'Tạm ẩn sách'}</span>
              </button>
            )}
          </div>

          {/* Action on this book: Borrow, Exchange */}
          <div>
            {!hasReadingAccess && (
              isAvailable ? (
                book.type === 'exchange' ? (
                  <button
                    onClick={handleExchangeRequest}
                    className="py-2.5 px-5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-700/20 transition-all active:scale-95"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Đề nghị trao đổi</span>
                  </button>
                ) : (
                  <button
                    onClick={handleBorrow}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Mượn sách (−10đ)</span>
                  </button>
                )
              ) : (
                <span className="text-xs font-bold opacity-60 bg-black/5 dark:bg-white/10 px-4 py-2.5 rounded-xl">
                  Sách hiện đang được mượn
                </span>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
