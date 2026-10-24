import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  BookmarkCheck, 
  ArrowLeftRight, 
  Clock, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';
import BookCard from '../components/library/BookCard';

export default function MyBooksPage({ onOpenBookDetail, onQuickRead, onOpenAddBook }) {
  const { currentUser, openAuth } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('owned'); // 'owned' | 'borrowed'

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs opacity-60 mb-6">Bạn cần đăng nhập để quản lý Kho sách cá nhân của mình.</p>
        <button
          onClick={() => openAuth('login')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const allBooks = storageService.getBooks();
  const allTxs = storageService.getTransactions();

  // 1. Sách của tôi (Owned)
  const myOwnedBooks = allBooks.filter(
    (b) => b.ownerId === currentUser.id || b.ownerUsername === currentUser.username
  );

  // 2. Sách mượn / trao đổi (Active borrowed or exchanged books)
  const myBorrowedOrExchangedTxs = allTxs.filter(
    (t) =>
      t.status === 'active' &&
      ((t.type === 'borrow' && (t.borrowerId === currentUser.id || t.borrowerUsername === currentUser.username)) ||
        (t.type === 'exchange' &&
          (t.ownerA_Id === currentUser.id ||
            t.ownerA_Username === currentUser.username ||
            t.ownerB_Id === currentUser.id ||
            t.ownerB_Username === currentUser.username)))
  );

  // Find book objects for borrowed transactions
  const myBorrowedBooks = myBorrowedOrExchangedTxs.map((tx) => {
    let bookId = tx.bookId;
    if (tx.type === 'exchange') {
      bookId = (tx.ownerA_Id === currentUser.id || tx.ownerA_Username === currentUser.username) ? tx.bookIdB : tx.bookIdA;
    }
    const found = allBooks.find((b) => b.id === bookId);
    return found ? { ...found, txDueDate: tx.dueDate, txType: tx.type } : null;
  }).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-black/10 dark:border-white/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>Kho sách của tôi</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-60 mt-1">
          Quản lý những đầu sách bạn đang sở hữu và các tác phẩm đang mượn hoặc trao đổi với bạn đọc khác.
        </p>
      </div>

      {/* Sub Tabs: "Sách của tôi" / "Sách mượn/trao đổi" */}
      <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('owned')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'owned'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sách của tôi ({myOwnedBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('borrowed')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'borrowed'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Sách mượn / Trao đổi ({myBorrowedBooks.length})</span>
        </button>
      </div>

      {/* TAB 1: SÁCH CỦA TÔI (OWNED) */}
      {activeTab === 'owned' && (
        <div>
          {myOwnedBooks.length > 0 && (
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs opacity-60 font-medium">Danh sách các đầu sách bạn đang chia sẻ:</span>
              <button
                onClick={onOpenAddBook}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng sách mới (+15đ)</span>
              </button>
            </div>
          )}
          {myOwnedBooks.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base mb-1">Bạn chưa đăng tải cuốn sách nào</h3>
              <p className="text-xs opacity-60 mb-5">Đăng sách lên để nhận ngay 15 điểm và cho bạn đọc khác mượn hoặc trao đổi.</p>
              <button
                onClick={onOpenAddBook}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng sách mới (+15đ)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {myOwnedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onOpenDetail={onOpenBookDetail}
                  onQuickRead={onQuickRead}
                  isMyBook={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SÁCH MƯỢN / TRAO ĐỔI (ACTIVE BORROWED/EXCHANGED) */}
      {activeTab === 'borrowed' && (
        <div>
          {myBorrowedBooks.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
                <BookmarkCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base mb-1">Hiện bạn không mượn hoặc trao đổi cuốn sách nào</h3>
              <p className="text-xs opacity-60 mb-5">Khám phá Tủ sách cộng đồng để mượn hoặc đổi những cuốn sách kinh điển yêu thích.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {myBorrowedBooks.map((book) => (
                <div key={book.id} className="relative flex flex-col">
                  <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold shadow-md">
                    Hạn: {book.txDueDate}
                  </div>
                  <BookCard
                    book={book}
                    onOpenDetail={onOpenBookDetail}
                    onQuickRead={onQuickRead}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
