import { INITIAL_USERS } from '../data/seedUsers';
import { INITIAL_BOOKS } from '../data/seedBooks';
import { INITIAL_PINS } from '../data/seedPins';
import { apiService } from './apiService';

const KEYS = {
  USERS: 'openlib_users',
  CURRENT_USER: 'openlib_current_user',
  BOOKS: 'openlib_books',
  PINS: 'openlib_pins',
  TRANSACTIONS: 'openlib_transactions',
  POINTS_HISTORY: 'openlib_points_history',
  NOTIFICATIONS: 'openlib_notifications',
};

// Initial transaction seed for realistic demo
const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_1',
    type: 'borrow',
    bookId: 'book_ngan_nam_ao_mu', // Ngàn Năm Áo Mũ (sách của lethanhquan)
    bookTitle: 'Ngàn Năm Áo Mũ: Lịch Sử Trang Phục Việt Nam Giai Đoạn 1009-1945',
    borrowerId: 'user_vanbach',
    borrowerUsername: 'vanbach',
    borrowerName: 'Văn Bách',
    ownerId: 'user_1',
    ownerUsername: 'lethanhquan',
    ownerName: 'Thanh Quân',
    status: 'active',
    borrowDate: '2026-10-14',
    dueDate: '2026-10-21',
    extended: false,
    extendRequested: false,
    returnedByBorrower: false,
    confirmedByOwner: false,
  },
  {
    id: 'tx_2',
    type: 'exchange',
    bookIdA: 'book_1', // Truyện Kiều (của tienanh)
    bookTitleA: 'Truyện Kiều',
    ownerA_Id: 'user_tienanh',
    ownerA_Username: 'tienanh',
    ownerA_Name: 'Tiến Anh',
    bookIdB: 'book_2', // Nhà Giả Kim (của quynhanh)
    bookTitleB: 'Nhà Giả Kim (The Alchemist)',
    ownerB_Id: 'user_quynhanh',
    ownerB_Username: 'quynhanh',
    ownerB_Name: 'Quỳnh Anh',
    status: 'active',
    startDate: '2026-10-10',
    dueDate: '2026-10-24',
    extended: false,
    extendRequested: false,
    returnedByA: false,
    returnedByB: false,
  }
];

const INITIAL_POINTS_HISTORY = [
  {
    id: 'pt_1',
    userId: 'user_1',
    type: 'register',
    title: 'Đăng ký thành viên mới',
    points: 100,
    timestamp: '2026-10-14T09:00:00Z'
  },
  {
    id: 'pt_2',
    userId: 'user_1',
    type: 'lend',
    title: 'Cho mượn sách: Ngàn Năm Áo Mũ (độc giả Văn Bách)',
    points: 10,
    timestamp: '2026-10-14T09:30:00Z'
  },
  {
    id: 'pt_3',
    userId: 'user_vanbach',
    type: 'borrow',
    title: 'Mượn sách: Ngàn Năm Áo Mũ',
    points: -10,
    timestamp: '2026-10-14T09:30:00Z'
  }
];

export const storageService = {
  initStorage() {
    try {
      if (!localStorage.getItem(KEYS.USERS)) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      
      // Auto upgrade & sync books with accurate real cover images & lethanhquan as sharer
      let existingBooks = JSON.parse(localStorage.getItem(KEYS.BOOKS) || '[]');
      // Remove temporary synthetic books from image folders if previously cached
      existingBooks = existingBooks.filter(b => b.id !== 'book_boxer_codex' && b.id !== 'book_samuel_baron');

      if (!existingBooks.length) {
        localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      } else {
        const seedMap = new Map(INITIAL_BOOKS.map(b => [b.id, b]));
        existingBooks = existingBooks.map(b => {
          if (seedMap.has(b.id)) {
            const seed = seedMap.get(b.id);
            return {
              ...seed,
              ...b,
              title: seed.title,
              author: seed.author,
              coverImage: seed.coverImage,
              coverBg: seed.coverBg,
              description: seed.description,
              category: seed.category,
              format: seed.format,
              fileUrl: seed.fileUrl || b.fileUrl,
              fileName: seed.fileName || b.fileName,
              readingContent: seed.readingContent || b.readingContent,
              // Strictly respect seed ownership: lethanhquan for user's book, natural names for other books
              ownerId: seed.ownerId,
              ownerUsername: seed.ownerUsername,
              ownerName: seed.ownerName,
              // preserve transaction status if user borrowed it
              status: b.status || seed.status,
            };
          }
          return b;
        });
        const existingIds = new Set(existingBooks.map(b => b.id));
        const newSeedBooks = INITIAL_BOOKS.filter(b => !existingIds.has(b.id));
        if (newSeedBooks.length > 0) {
          existingBooks = [...existingBooks, ...newSeedBooks];
        }
        // Ensure user's authentic book is at the very top of community books
        const nganNamBook = existingBooks.find(b => b.id === 'book_ngan_nam_ao_mu');
        const otherBooks = existingBooks.filter(b => b.id !== 'book_ngan_nam_ao_mu');
        if (nganNamBook) {
          existingBooks = [nganNamBook, ...otherBooks];
        }
        localStorage.setItem(KEYS.BOOKS, JSON.stringify(existingBooks));
      }

      // Auto upgrade & sync pins with accurate real images & authentic authors
      let existingPins = JSON.parse(localStorage.getItem(KEYS.PINS) || '[]');
      if (!existingPins.length) {
        localStorage.setItem(KEYS.PINS, JSON.stringify(INITIAL_PINS));
      } else {
        const seedPinMap = new Map(INITIAL_PINS.map(p => [p.id, p]));
        existingPins = existingPins.map(p => {
          if (seedPinMap.has(p.id)) {
            const seedPin = seedPinMap.get(p.id);
            return {
              ...seedPin,
              ...p,
              title: seedPin.title,
              imageUrl: seedPin.imageUrl,
              description: seedPin.description,
              category: seedPin.category,
              format: seedPin.format,
              aspectRatio: seedPin.aspectRatio || p.aspectRatio,
              allowDownload: seedPin.allowDownload !== undefined ? seedPin.allowDownload : p.allowDownload,
              // Strictly respect seed authors: lethanhquan for Boxer Codex & Samuel Baron, natural names for other pins
              authorId: seedPin.authorId,
              authorUsername: seedPin.authorUsername,
              authorName: seedPin.authorName,
            };
          }
          return p;
        });
        const existingPinIds = new Set(existingPins.map(p => p.id));
        const newSeedPins = INITIAL_PINS.filter(p => !existingPinIds.has(p.id));
        if (newSeedPins.length > 0) {
          existingPins = [...existingPins, ...newSeedPins];
        }
        // Ensure user's historical photo collections (Boxer Codex and Samuel Baron) are at the top
        const userPins = existingPins.filter(p => p.authorUsername === 'lethanhquan');
        const otherPins = existingPins.filter(p => p.authorUsername !== 'lethanhquan');
        existingPins = [...userPins, ...otherPins];
        localStorage.setItem(KEYS.PINS, JSON.stringify(existingPins));
      }

      // Auto upgrade & sync users with natural community members
      let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      if (!users.length || users.some(u => u.username === 'tranthib' || u.username === 'levanc' || u.username === 'nguyenvana')) {
        const currentU = users.find(u => u.username === 'lethanhquan' || u.id === 'user_1') || INITIAL_USERS[0];
        const otherUsers = INITIAL_USERS.filter(u => u.id !== 'user_1');
        users = [currentU, ...otherUsers];
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }

      // Refresh demo transactions if holding obsolete dummy usernames
      let txs = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
      if (!txs.length || txs.some(t => t.borrowerUsername === 'tranthib' || t.ownerB_Username === 'levanc' || t.ownerUsername === 'tranthib' || t.bookId === 'book_4')) {
        txs = INITIAL_TRANSACTIONS;
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      } else if (txs.some(t => t.borrowerUsername === 'nguyenvana')) {
        txs = txs.map(t => {
          if (t.borrowerUsername === 'nguyenvana') {
            return {
              ...t,
              borrowerUsername: 'lethanhquan',
              borrowerName: 'Thanh Quân'
            };
          }
          return t;
        });
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
      }

      let curr = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
      if (curr && (curr.username === 'nguyenvana' || curr.id === 'user_1')) {
        curr = {
          ...curr,
          username: 'lethanhquan',
          displayName: 'Thanh Quân',
          email: 'thanhquan@gmail.com',
          joinedDate: '2026-04-23',
          avatarBg: 'bg-emerald-600',
          avatarText: 'TQ'
        };
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(curr));
      }
      if (!localStorage.getItem(KEYS.POINTS_HISTORY)) {
        localStorage.setItem(KEYS.POINTS_HISTORY, JSON.stringify(INITIAL_POINTS_HISTORY));
      }

      // Guest mode by default: Do not automatically force-login into demo account
      if (!localStorage.getItem('openlib_user_authenticated')) {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }

      // Asynchronous background sync with MySQL 8.0 Database
      apiService.checkHealth().then(health => {
        if (health?.alive) {
          console.log('🐬 OpenLib đã kết nối cơ sở dữ liệu MySQL 8.0 thành công!');
          // Sync books from MySQL if available
          apiService.getBooks().then(dbBooks => {
            if (dbBooks && dbBooks.length > 0) {
              localStorage.setItem(KEYS.BOOKS, JSON.stringify(dbBooks));
            }
          });
          // Sync pins from MySQL if available
          apiService.getPins().then(dbPins => {
            if (dbPins && dbPins.length > 0) {
              localStorage.setItem(KEYS.PINS, JSON.stringify(dbPins));
            }
          });
          // Sync transactions from MySQL if available
          apiService.getTransactions().then(dbTxs => {
            if (dbTxs && dbTxs.length > 0) {
              localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(dbTxs));
            }
          });
          // Sync users from MySQL if available
          apiService.getUsers().then(dbUsers => {
            if (dbUsers && dbUsers.length > 0) {
              localStorage.setItem(KEYS.USERS, JSON.stringify(dbUsers));
            }
          });
        }
      }).catch(err => {
        console.warn('MySQL sync skipped:', err);
      });
    } catch (e) {
      console.warn('LocalStorage init issue:', e);
    }
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USERS)) || INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users) {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user) {
    try {
      if (!user) {
        localStorage.removeItem(KEYS.CURRENT_USER);
      } else {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save current user:', e);
    }
  },

  getBooks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKS)) || INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  },

  saveBooks(books) {
    try {
      localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
      if (books && books.length > 0) {
        // Sync newly added book if any
        const latest = books[0];
        if (latest && latest.id && latest.id.startsWith('book_custom_')) {
          apiService.createBook(latest).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save books:', e);
    }
  },

  getPins() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.PINS)) || INITIAL_PINS;
    } catch {
      return INITIAL_PINS;
    }
  },

  savePins(pins) {
    try {
      localStorage.setItem(KEYS.PINS, JSON.stringify(pins));
      if (pins && pins.length > 0) {
        // Sync newly added pin if any
        const latest = pins[0];
        if (latest && latest.id && latest.id.startsWith('pin_custom_')) {
          apiService.createPin(latest).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save pins:', e);
    }
  },

  getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS)) || INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(txs) {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
      if (txs && txs.length > 0) {
        const latest = txs[0];
        if (latest && latest.id && latest.id.startsWith('tx_')) {
          apiService.createTransaction(latest).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  getPointsHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.POINTS_HISTORY)) || INITIAL_POINTS_HISTORY;
    } catch {
      return INITIAL_POINTS_HISTORY;
    }
  },

  savePointsHistory(history) {
    try {
      localStorage.setItem(KEYS.POINTS_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save points history:', e);
    }
  },

  getReadNotifications(userId) {
    try {
      return JSON.parse(localStorage.getItem(`readNotifs_${userId}`)) || [];
    } catch {
      return [];
    }
  },

  saveReadNotifications(userId, ids) {
    try {
      localStorage.setItem(`readNotifs_${userId}`, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save read notifications:', e);
    }
  },

  getLikedPins(userId) {
    if (!userId) return [];
    try {
      return JSON.parse(localStorage.getItem(`likedPins_${userId}`)) || [];
    } catch {
      return [];
    }
  },

  saveLikedPins(userId, ids) {
    if (!userId) return;
    try {
      localStorage.setItem(`likedPins_${userId}`, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save liked pins:', e);
    }
  },

  isPinLiked(userId, pinId) {
    if (!userId || !pinId) return false;
    const liked = this.getLikedPins(userId);
    return liked.includes(pinId);
  },

  toggleLikedPin(userId, pinId) {
    if (!userId || !pinId) return false;
    const liked = this.getLikedPins(userId);
    const index = liked.indexOf(pinId);
    let isNowLiked = false;
    if (index >= 0) {
      liked.splice(index, 1);
      isNowLiked = false;
    } else {
      liked.push(pinId);
      isNowLiked = true;
    }
    this.saveLikedPins(userId, liked);
    apiService.toggleLikePin(pinId, userId).catch(() => {});
    return isNowLiked;
  }
};
