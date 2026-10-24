import { storageService } from './storageService';

export const pointService = {
  addPoints(userId, amount, type, title) {
    const users = storageService.getUsers();
    // Support matching by ID, username or email for absolute safety
    const userIndex = users.findIndex(
      (u) => u.id === userId || u.username === userId || (u.email && u.email === userId)
    );
    if (userIndex === -1) return null;

    const previousPoints = users[userIndex].points || 0;
    users[userIndex].points = Math.max(0, previousPoints + amount);
    storageService.saveUsers(users);

    // If current logged-in user, update session as well
    const currentUser = storageService.getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === users[userIndex].id ||
        currentUser.username === users[userIndex].username)
    ) {
      currentUser.points = users[userIndex].points;
      storageService.saveCurrentUser(currentUser);
    }

    // Add to history
    const history = storageService.getPointsHistory();
    const newLog = {
      id: 'pt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: users[userIndex].id,
      type,
      title,
      points: amount,
      timestamp: new Date().toISOString()
    };
    history.unshift(newLog);
    storageService.savePointsHistory(history);

    // Dispatch global event for instant reactive UI updates
    try {
      window.dispatchEvent(
        new CustomEvent('openlib_points_updated', {
          detail: { userId: users[userIndex].id, points: users[userIndex].points, amount }
        })
      );
    } catch {}

    return users[userIndex];
  },

  addViolation(userId, reason) {
    const users = storageService.getUsers();
    const userIndex = users.findIndex(
      (u) => u.id === userId || u.username === userId
    );
    if (userIndex === -1) return null;

    users[userIndex].violations = (users[userIndex].violations || 0) + 1;
    storageService.saveUsers(users);

    const currentUser = storageService.getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === users[userIndex].id ||
        currentUser.username === users[userIndex].username)
    ) {
      currentUser.violations = users[userIndex].violations;
      storageService.saveCurrentUser(currentUser);
    }

    return users[userIndex];
  },

  canBorrowOrExchange(user) {
    if (!user) return { allowed: false, reason: 'Vui lòng đăng nhập.' };
    if ((user.violations || 0) >= 3) {
      return { allowed: false, reason: 'Tài khoản đã vi phạm 3 lần, bị khóa quyền mượn và trao đổi.' };
    }
    return { allowed: true };
  },

  canBorrowBook(user, book) {
    const basicCheck = this.canBorrowOrExchange(user);
    if (!basicCheck.allowed) return basicCheck;

    if (user.id === book.ownerId || user.username === book.ownerUsername) {
      return { allowed: false, reason: 'Đây là sách của bạn!' };
    }
    // Updated: Only requires 10 points instead of 25 points
    if ((user.points || 0) < 10) {
      return { allowed: false, reason: `Số dư hiện tại (${user.points || 0}đ) không đủ 10 điểm để mượn sách này.` };
    }
    if (book.status !== 'available') {
      return { allowed: false, reason: 'Sách hiện đang được người khác mượn.' };
    }
    return { allowed: true };
  },

  canDownloadPin(user, pin) {
    if (!user) return { allowed: false, reason: 'Vui lòng đăng nhập.' };
    if (!pin.allowDownload) return { allowed: false, reason: 'Tác giả đã khóa quyền tải ảnh này.' };
    if (user.id === pin.authorId || user.username === pin.authorUsername) {
      return { allowed: true, isOwner: true }; // Free for owner
    }
    if ((user.points || 0) < 10) {
      return { allowed: false, reason: `Bạn cần ít nhất 10 điểm để tải ảnh này (Số dư: ${user.points || 0}đ).` };
    }
    return { allowed: true, isOwner: false };
  }
};
