import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CommunityPage from './pages/CommunityPage';
import MyLibraryPage from './pages/MyLibraryPage';
import TransactionsPage from './pages/TransactionsPage';
import PointsPage from './pages/PointsPage';
import ProfilePage from './pages/ProfilePage';
import AuthModal from './pages/AuthModal';

import BookDetailModal from './components/library/BookDetailModal';
import AddBookModal from './components/library/AddBookModal';
import PinDetailModal from './components/pinterest/PinDetailModal';
import AddPinModal from './components/pinterest/AddPinModal';
import OpenReaderModal from './components/reader/OpenReaderModal';

import { pinService } from './services/pinService';
import { storageService } from './services/storageService';
import { useAuth } from './context/AuthContext';
import { useNotification } from './context/NotificationContext';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { currentUser, openAuth, refreshUser } = useAuth();
  const { refreshNotifications } = useNotification();
  const { theme } = useTheme();

  // Route state via hash
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/community');

  // Trigger state update across components
  const [dataVersion, setDataVersion] = useState(0);
  const triggerRefresh = () => {
    setDataVersion(prev => prev + 1);
    refreshUser();
    refreshNotifications();
  };

  // Modals state
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);

  const [selectedPin, setSelectedPin] = useState(null);
  const [isPinDetailOpen, setIsPinDetailOpen] = useState(false);

  const [readerBook, setReaderBook] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddPinOpen, setIsAddPinOpen] = useState(false);

  // Hash route listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/community';
      setCurrentRoute(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '#/community';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Khóa cuộn trang khi chụp ảnh màn hình (Ctrl+Shift+S) để trang web đứng yên 1 chỗ
  useEffect(() => {
    let unlockTimer = null;
    const lockScroll = () => {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(unlockScroll, 10000);
    };

    const unlockScroll = () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      clearTimeout(unlockTimer);
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's' || e.code === 'KeyS')) {
        lockScroll();
      }
      if (e.key === 'Escape') {
        unlockScroll();
      }
    };

    const handleMouseUp = () => {
      if (document.body.style.overflow === 'hidden') {
        setTimeout(unlockScroll, 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      clearTimeout(unlockTimer);
    };
  }, []);

  const navigateTo = (route) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  // Handlers for interactions
  const handleOpenBookDetail = (book) => {
    setSelectedBook(book);
    setIsBookDetailOpen(true);
  };

  const handleOpenPinDetail = (pin) => {
    pinService.incrementView(pin.id);
    setSelectedPin(pin);
    setIsPinDetailOpen(true);
  };

  const handleQuickRead = (book) => {
    const activeTxs = storageService.getTransactions();
    const isMyBook = currentUser && (currentUser.id === book.ownerId || currentUser.username === book.ownerUsername);
    const isAlreadyBorrowedOrExchanged = currentUser && activeTxs.some(t => {
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

    if (!isMyBook && !isAlreadyBorrowedOrExchanged) {
      setSelectedBook(book);
      setIsBookDetailOpen(true);
      return;
    }

    setReaderBook(book);
    setIsReaderOpen(true);
  };

  const handleQuickDownloadPin = (pin) => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    try {
      pinService.downloadPin(pin.id, currentUser);
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLikePin = (pinId) => {
    const res = pinService.likePin(pinId, currentUser);
    triggerRefresh();
    return res;
  };

  let mainBg = 'bg-slate-50 text-slate-900';
  if (theme === 'sepia') mainBg = 'bg-[#F4ECD8] text-[#433422]';
  if (theme === 'dark') mainBg = 'bg-[#0B0F19] text-slate-100';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-600 selection:text-white ${mainBg}`}>
      
      {/* Top Fixed Header Navbar */}
      <Navbar
        activeRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenBookDetail={handleOpenBookDetail}
        onOpenPinDetail={handleOpenPinDetail}
      />

      {/* Main Routed Page Content */}
      <div className="flex-1" key={dataVersion}>
        {currentRoute === '#/community' && (
          <CommunityPage
            onOpenBookDetail={handleOpenBookDetail}
            onQuickRead={handleQuickRead}
            onOpenPinDetail={handleOpenPinDetail}
            onQuickDownload={handleQuickDownloadPin}
            onLikePin={handleLikePin}
          />
        )}

        {(currentRoute.startsWith('#/my-library') || currentRoute.startsWith('#/my-books') || currentRoute.startsWith('#/my-pins') || currentRoute === '#/my') && (
          <MyLibraryPage
            initialTab={currentRoute.startsWith('#/my-pins') ? 'pins' : 'books'}
            onOpenBookDetail={handleOpenBookDetail}
            onQuickRead={handleQuickRead}
            onOpenPinDetail={handleOpenPinDetail}
            onOpenAddBook={() => setIsAddBookOpen(true)}
            onOpenAddPin={() => setIsAddPinOpen(true)}
            onQuickDownload={handleQuickDownloadPin}
            onLikePin={handleLikePin}
          />
        )}

        {currentRoute.startsWith('#/transactions') && (
          <TransactionsPage
            onOpenBookDetail={handleOpenBookDetail}
            onQuickRead={handleQuickRead}
          />
        )}

        {currentRoute === '#/points' && (
          <PointsPage />
        )}

        {currentRoute === '#/profile' && (
          <ProfilePage />
        )}
      </div>

      {/* Website Dark Green Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals */}
      <BookDetailModal
        book={selectedBook}
        isOpen={isBookDetailOpen}
        onClose={() => setIsBookDetailOpen(false)}
        onReadOnline={handleQuickRead}
        onBookUpdated={triggerRefresh}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onBookAdded={triggerRefresh}
      />

      <PinDetailModal
        pin={selectedPin}
        isOpen={isPinDetailOpen}
        onClose={() => setIsPinDetailOpen(false)}
        onPinUpdated={triggerRefresh}
      />

      <AddPinModal
        isOpen={isAddPinOpen}
        onClose={() => setIsAddPinOpen(false)}
        onPinAdded={triggerRefresh}
      />

      {/* Online Book Reader Modal */}
      <OpenReaderModal
        book={readerBook}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />

      {/* Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal />

    </div>
  );
}
