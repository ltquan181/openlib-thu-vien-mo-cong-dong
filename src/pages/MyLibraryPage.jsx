import React, { useState } from 'react';
import { 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  BookmarkCheck, 
  Heart,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';
import BookCard from '../components/library/BookCard';
import PinCard from '../components/pinterest/PinCard';

export default function MyLibraryPage({ 
  onOpenBookDetail, 
  onQuickRead, 
  onOpenPinDetail, 
  onOpenAddBook, 
  onOpenAddPin, 
  onQuickDownload, 
  onLikePin,
  initialTab = 'books'
}) {
  const { currentUser, openAuth } = useAuth();
  const { theme } = useTheme();

  const [activeMainTab, setActiveMainTab] = useState(initialTab); // 'books' | 'pins'
  const [bookSubTab, setBookSubTab] = useState('owned'); // 'owned' | 'borrowed'
  const [pinSubTab, setPinSubTab] = useState('my-pins'); // 'my-pins' | 'liked-pins'

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs opacity-60 mb-6">Bạn cần đăng nhập để quản lý Thư viện cá nhân của mình.</p>
        <button
          onClick={() => openAuth('login')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const allBooks = storageService.getBooks();
  const allPins = storageService.getPins();
  const allTxs = storageService.getTransactions();

  // 1. Sách của tôi (Owned)
  const myOwnedBooks = allBooks.filter(
    (b) => b.ownerId === currentUser.id || b.ownerUsername === currentUser.username
  );

  // 2. Sách mượn / Trao đổi (Active borrowed or exchanged)
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

  const myBorrowedBooks = myBorrowedOrExchangedTxs.map((tx) => {
    let bookId = tx.bookId;
    if (tx.type === 'exchange') {
      bookId = (tx.ownerA_Id === currentUser.id || tx.ownerA_Username === currentUser.username) ? tx.bookIdB : tx.bookIdA;
    }
    const found = allBooks.find((b) => b.id === bookId);
    return found ? { ...found, txDueDate: tx.dueDate, txType: tx.type } : null;
  }).filter(Boolean);

  // 3. Ảnh của tôi (Uploaded by me)
  const myPins = allPins.filter(
    (p) => p.authorId === currentUser.id || p.authorUsername === currentUser.username
  );

  // 4. Ảnh đã thích (Liked pins from community)
  const likedPinIds = storageService.getLikedPins(currentUser.id);
  const myLikedPins = allPins.filter((p) => likedPinIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-black/10 dark:border-white/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-3">
          <Layers className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <span>Thư viện của tôi</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-60 mt-1">
          Không gian quản lý tập trung toàn bộ Kho sách cá nhân, sách mượn/đổi và Kho ảnh nghệ thuật của bạn trên OpenLib.
        </p>
      </div>

      {/* 2 Main Tabs: Kho sách của tôi & Kho ảnh của tôi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          
          {/* Nút 1: Kho sách của tôi */}
          <button
            onClick={() => setActiveMainTab('books')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeMainTab === 'books'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho sách của tôi ({myOwnedBooks.length + myBorrowedBooks.length})</span>
          </button>

          {/* Nút 2: Kho ảnh của tôi */}
          <button
            onClick={() => setActiveMainTab('pins')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeMainTab === 'pins'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Kho ảnh của tôi ({myPins.length + myLikedPins.length})</span>
          </button>

        </div>

        {/* Sub Tabs Controls */}
        {activeMainTab === 'books' && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <button
              onClick={() => setBookSubTab('owned')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bookSubTab === 'owned'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📚 Sách của tôi ({myOwnedBooks.length})
            </button>
            <button
              onClick={() => setBookSubTab('borrowed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bookSubTab === 'borrowed'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              🔄 Sách mượn / Trao đổi ({myBorrowedBooks.length})
            </button>
          </div>
        )}

        {activeMainTab === 'pins' && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <button
              onClick={() => setPinSubTab('my-pins')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                pinSubTab === 'my-pins'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              🖼️ Ảnh của tôi ({myPins.length})
            </button>
            <button
              onClick={() => setPinSubTab('liked-pins')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pinSubTab === 'liked-pins'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Ảnh đã thích ({myLikedPins.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: KHO SÁCH CỦA TÔI */}
      {/* ======================================================== */}
      {activeMainTab === 'books' && (
        <div>
          {/* Sub-tab 1.1: SÁCH CỦA TÔI (OWNED) - Nút đăng sách nằm tại đây */}
          {bookSubTab === 'owned' && (
            <div>
              {myOwnedBooks.length > 0 && (
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs opacity-60 font-medium">Danh sách các đầu sách bạn sở hữu & đang chia sẻ:</span>
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

          {/* Sub-tab 1.2: SÁCH MƯỢN / TRAO ĐỔI (Không có nút đăng sách) */}
          {bookSubTab === 'borrowed' && (
            <div>
              {myBorrowedBooks.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
                    <BookmarkCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base mb-1">Hiện bạn không mượn hoặc trao đổi cuốn sách nào</h3>
                  <p className="text-xs opacity-60 mb-5">Khám phá Kho sách cộng đồng để mượn hoặc đề nghị đổi những cuốn sách hay.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {myBorrowedBooks.map((book) => (
                    <div key={book.id} className="relative flex flex-col">
                      <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Hạn: {book.txDueDate}</span>
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
      )}

      {/* ======================================================== */}
      {/* SECTION 2: KHO ẢNH CỦA TÔI */}
      {/* ======================================================== */}
      {activeMainTab === 'pins' && (
        <div>
          {/* Sub-tab 2.1: ẢNH CỦA TÔI - Nút đăng ảnh nằm tại đây */}
          {pinSubTab === 'my-pins' && (
            <div>
              {myPins.length > 0 && (
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs opacity-60 font-medium">Các tác phẩm nghệ thuật bạn đã chia sẻ ({myPins.length}):</span>
                  <button
                    onClick={onOpenAddPin}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng ảnh mới (+15đ)</span>
                  </button>
                </div>
              )}

              {myPins.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base mb-1">Bạn chưa chia sẻ tác phẩm ảnh nào</h3>
                  <p className="text-xs opacity-60 mb-5">Mỗi tác phẩm đăng thành công bạn sẽ nhận ngay 15 điểm thưởng!</p>
                  <button
                    onClick={onOpenAddPin}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
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
          )}

          {/* Sub-tab 2.2: ẢNH ĐÃ THÍCH (Không có nút đăng ảnh) */}
          {pinSubTab === 'liked-pins' && (
            <div>
              {myLikedPins.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base mb-1">Bạn chưa thả tim tác phẩm ảnh nào</h3>
                  <p className="text-xs opacity-60 mb-5">
                    Hãy dạo quanh Kho ảnh cộng đồng và bấm nút Thả tim để lưu lại những tác phẩm nghệ thuật bạn yêu thích tại đây!
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs opacity-60 font-medium">
                      Danh sách các tác phẩm ảnh bạn đã thả tim yêu thích ({myLikedPins.length}):
                    </span>
                  </div>
                  <div className="masonry-grid w-full">
                    {myLikedPins.map((pin) => (
                      <PinCard
                        key={pin.id}
                        pin={pin}
                        onOpenDetail={onOpenPinDetail}
                        onQuickDownload={onQuickDownload}
                        onLike={onLikePin}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
