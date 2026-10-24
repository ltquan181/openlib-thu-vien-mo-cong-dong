import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ArrowLeftRight, 
  BookmarkCheck, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  RotateCcw,
  BookOpen,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';
import { bookService } from '../services/bookService';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function TransactionsPage({ onOpenBookDetail, onQuickRead, initialTab, highlightTxId }) {
  const { currentUser, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { refreshNotifications } = useNotification();

  const getHashParams = () => {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const query = hash.slice(qIndex + 1);
    const params = {};
    query.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v) params[k] = decodeURIComponent(v);
    });
    return params;
  };

  const hashParams = getHashParams();
  const [activeTab, setActiveTab] = useState(
    initialTab || hashParams.tab || 'pending'
  );
  const [highlightedId, setHighlightedId] = useState(
    highlightTxId || hashParams.tx || null
  );

  React.useEffect(() => {
    const p = getHashParams();
    if (p.tab) setActiveTab(p.tab);
    if (p.tx) setHighlightedId(p.tx);
  }, []);

  React.useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`tx-card-${highlightedId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [highlightedId, activeTab]);

  const txs = storageService.getTransactions();
  const allBooks = storageService.getBooks();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs opacity-60">Bạn cần đăng nhập để xem thông tin Giỏ sách cộng đồng của mình.</p>
      </div>
    );
  }

  // 1. Pending exchange requests waiting for ME to approve
  const pendingRequests = txs.filter(
    (t) => t.type === 'exchange' && t.status === 'pending' && (t.ownerA_Id === currentUser.id || t.ownerA_Username === currentUser.username)
  );

  // 2. Active transactions
  const activeTransactions = txs.filter(
    (t) =>
      t.status === 'active' &&
      (t.borrowerId === currentUser.id ||
        t.borrowerUsername === currentUser.username ||
        t.ownerId === currentUser.id ||
        t.ownerUsername === currentUser.username ||
        t.ownerA_Id === currentUser.id ||
        t.ownerA_Username === currentUser.username ||
        t.ownerB_Id === currentUser.id ||
        t.ownerB_Username === currentUser.username)
  );

  // 3. History
  const historyTransactions = txs.filter(
    (t) =>
      (t.status === 'returned' || t.status === 'rejected') &&
      (t.borrowerId === currentUser.id ||
        t.borrowerUsername === currentUser.username ||
        t.ownerId === currentUser.id ||
        t.ownerUsername === currentUser.username ||
        t.ownerA_Id === currentUser.id ||
        t.ownerA_Username === currentUser.username ||
        t.ownerB_Id === currentUser.id ||
        t.ownerB_Username === currentUser.username)
  );

  // Handlers
  const handleApproveExchange = (txId) => {
    try {
      bookService.approveExchange(txId, currentUser);
      refreshUser();
      refreshNotifications();
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch {}
      showToast('Đã duyệt trao đổi sách! Bạn và đối tác đều nhận được +5 điểm.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectExchange = (txId) => {
    try {
      bookService.rejectExchange(txId, currentUser);
      refreshNotifications();
      showToast('Đã từ chối yêu cầu trao đổi.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnBorrow = (txId) => {
    try {
      bookService.returnBorrowBook(txId, currentUser);
      refreshUser();
      refreshNotifications();
      showToast('Đã xác nhận hoàn trả sách thành công!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnExchange = (txId) => {
    try {
      bookService.returnExchangeBook(txId, currentUser);
      refreshUser();
      refreshNotifications();
      showToast('Đã bấm xác nhận trả sách trao đổi.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRequestExtend = (txId) => {
    try {
      bookService.requestExtension(txId);
      refreshNotifications();
      showToast('Đã gửi yêu cầu xin gia hạn thêm 7 ngày.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleApproveExtend = (txId) => {
    try {
      bookService.approveExtension(txId);
      refreshNotifications();
      showToast('Đã đồng ý gia hạn thêm 7 ngày cho giao dịch.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  let cardBg = 'bg-white border-slate-200/90 text-slate-800';
  if (theme === 'sepia') {
    cardBg = 'bg-[#FAF3E0] border-[#E8D9BD] text-[#433422]';
  } else if (theme === 'dark') {
    cardBg = 'bg-[#151C2C] border-[#1E293B] text-slate-100';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-black/10 dark:border-white/10 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>Giỏ sách cộng đồng</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-60 mt-1">
          Theo dõi các giao dịch mượn trả, phê duyệt trao đổi P2P và gia hạn thời hạn sách.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          <span>📥 Chờ tôi duyệt</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          <span>⚡ Đang hoạt động</span>
          <span className="px-2 py-0.5 rounded-full bg-black/20 dark:bg-white/20 text-[10px] font-mono">
            {activeTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử ({historyTransactions.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING REVIEW */}
      {activeTab === 'pending' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className={`py-16 text-center rounded-3xl border p-8 ${cardBg}`}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm">Không có yêu cầu nào đang chờ bạn duyệt</h3>
              <p className="text-xs opacity-60 mt-1">Khi có bạn đọc muốn đổi sách với bạn, yêu cầu sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const isHighlighted = highlightedId === req.id;
                return (
                  <div 
                    key={req.id} 
                    id={`tx-card-${req.id}`}
                    className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${cardBg} ${
                      isHighlighted ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/25 bg-purple-50/30 dark:bg-purple-950/40 scale-[1.01]' : ''
                    }`}
                  >
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          Đề nghị trao đổi
                        </span>
                        <span className="text-xs opacity-60 font-mono">📅 Ngày gửi: {req.requestDate}</span>
                        {isHighlighted && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold animate-pulse">
                            Từ thông báo
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm">
                        Độc giả <strong className="text-purple-700 dark:text-purple-300">@{req.ownerB_Username} ({req.ownerB_Name})</strong> muốn trao đổi sách:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] opacity-60 block">Sách của bạn:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">📖 {req.bookTitleA}</span>
                        </div>
                        <div>
                          <span className="text-[10px] opacity-60 block">Đổi lấy cuốn của đối tác:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">📖 {req.bookTitleB}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveExchange(req.id)}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Duyệt (+5đ mỗi bên)</span>
                      </button>
                      <button
                        onClick={() => handleRejectExchange(req.id)}
                        className="py-2 px-3 rounded-xl border border-black/20 dark:border-white/20 hover:bg-black/5 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE TRANSACTIONS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeTransactions.length === 0 ? (
            <div className={`py-16 text-center rounded-3xl border p-8 ${cardBg}`}>
              <h3 className="font-bold text-sm">Hiện bạn không có giao dịch mượn/đổi nào đang diễn ra</h3>
              <p className="text-xs opacity-60 mt-1">Hãy ghé qua Kho sách cộng đồng để mượn hoặc đề nghị trao đổi những cuốn sách yêu thích!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTransactions.map((tx) => {
                const isBorrow = tx.type === 'borrow';
                const isBorrower = isBorrow && (tx.borrowerId === currentUser.id || tx.borrowerUsername === currentUser.username);
                const isExchange = tx.type === 'exchange';

                const dueDateObj = new Date(tx.dueDate);
                const isOverdue = dueDateObj < new Date();
                const isHighlighted = highlightedId === tx.id;

                // Determine book for reading
                let bookToRead = null;
                const isOwnerA = tx.ownerA_Id === currentUser.id || tx.ownerA_Username === currentUser.username;
                if (isBorrow && isBorrower) {
                  bookToRead = allBooks.find(b => b.id === tx.bookId);
                } else if (isExchange) {
                  bookToRead = allBooks.find(b => b.id === (isOwnerA ? tx.bookIdB : tx.bookIdA));
                }

                const myExchBook = isOwnerA ? tx.bookTitleA : tx.bookTitleB;
                const partnerExchBook = isOwnerA ? tx.bookTitleB : tx.bookTitleA;
                const partnerName = isOwnerA ? `${tx.ownerB_Name || tx.ownerB_Username} (@${tx.ownerB_Username})` : `${tx.ownerA_Name || tx.ownerA_Username} (@${tx.ownerA_Username})`;

                return (
                  <div 
                    key={tx.id} 
                    id={`tx-card-${tx.id}`}
                    className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${cardBg} ${
                      isHighlighted ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/40 scale-[1.01]' : ''
                    }`}
                  >
                    
                    <div className="space-y-2 text-left flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isExchange ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isExchange ? '🔄 Trao đổi P2P' : isBorrower ? '📖 Bạn đang mượn' : '📖 Bạn đang cho mượn'}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                          isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Hạn trả: {tx.dueDate} {isOverdue && '(Đã quá hạn!)'}</span>
                        </span>

                        {tx.borrowDate && (
                          <span className="text-[11px] opacity-60 font-mono">
                            Ngày mượn: {tx.borrowDate}
                          </span>
                        )}

                        {tx.startDate && (
                          <span className="text-[11px] opacity-60 font-mono">
                            Ngày đổi: {tx.startDate}
                          </span>
                        )}

                        {isHighlighted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold animate-pulse">
                            Từ thông báo
                          </span>
                        )}
                      </div>

                      {/* Book & Partner Metadata */}
                      {isBorrow ? (
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>{tx.bookTitle}</span>
                          </h4>
                          <p className="text-xs opacity-75">
                            {isBorrower 
                              ? `Chủ sở hữu sách: @${tx.ownerUsername} (${tx.ownerName || 'Chủ sách'})`
                              : `Người đang mượn sách của bạn: @${tx.borrowerUsername} (${tx.borrowerName || 'Bạn đọc'})`
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {tx.bookTitleA} ⇄ {tx.bookTitleB}
                          </h4>
                          <div className="text-xs opacity-80 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Sách của bạn: <strong>{myExchBook}</strong></span>
                            <span>Sách nhận đổi: <strong>{partnerExchBook}</strong></span>
                            <span>Đối tác: <strong>{partnerName}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Đọc sách ngay button */}
                      {bookToRead && (
                        <button
                          onClick={() => {
                            if (onQuickRead) onQuickRead(bookToRead);
                            else if (onOpenBookDetail) onOpenBookDetail(bookToRead);
                          }}
                          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                          title="Đọc trực tuyến"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Đọc sách ngay</span>
                        </button>
                      )}
                      
                      {isBorrow && (
                        <>
                          {isBorrower ? (
                            <button
                              onClick={() => handleReturnBorrow(tx.id)}
                              className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="w-4 h-4" />
                              <span>Xác nhận đã trả</span>
                            </button>
                          ) : (
                            <span className="text-xs opacity-60 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-xl">
                              Đang chờ người mượn hoàn trả
                            </span>
                          )}

                          {isBorrower && !tx.extended && !tx.extendRequested && (
                            <button
                              onClick={() => handleRequestExtend(tx.id)}
                              className="py-2 px-3 rounded-xl border border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Xin +7 ngày</span>
                            </button>
                          )}

                          {!isBorrower && tx.extendRequested && (
                            <button
                              onClick={() => handleApproveExtend(tx.id)}
                              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                            >
                              Duyệt +7 ngày
                            </button>
                          )}
                        </>
                      )}

                      {isExchange && (
                        <>
                          <button
                            onClick={() => handleReturnExchange(tx.id)}
                            className="py-2 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Tôi đã gửi trả</span>
                          </button>

                          {!tx.extended && !tx.extendRequested && (
                            <button
                              onClick={() => handleRequestExtend(tx.id)}
                              className="py-2 px-3 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Xin +7 ngày</span>
                            </button>
                          )}

                          {tx.extendRequested && (
                            <button
                              onClick={() => handleApproveExtend(tx.id)}
                              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                            >
                              Duyệt +7 ngày
                            </button>
                          )}
                        </>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div>
          {historyTransactions.length === 0 ? (
            <div className={`py-16 text-center rounded-3xl border p-8 ${cardBg}`}>
              <h3 className="font-bold text-sm">Chưa có giao dịch nào được lưu vào lịch sử</h3>
            </div>
          ) : (
            <div className={`divide-y divide-black/5 dark:divide-white/5 rounded-3xl border overflow-hidden shadow-xs ${cardBg}`}>
              {historyTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        tx.status === 'returned' ? 'bg-emerald-100 text-emerald-800' : 'bg-black/10 dark:bg-white/10 opacity-70'
                      }`}>
                        {tx.status === 'returned' ? 'Đã hoàn tất' : 'Đã từ chối'}
                      </span>
                      <span className="opacity-50 font-mono">{tx.returnDate || tx.dueDate}</span>
                    </div>
                    <p className="font-bold text-sm">
                      {tx.type === 'exchange' ? `${tx.bookTitleA} ⇄ ${tx.bookTitleB}` : tx.bookTitle}
                    </p>
                  </div>
                  <span className="opacity-60 font-medium">
                    {tx.type === 'exchange' ? 'Trao đổi P2P' : 'Mượn-trả'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
