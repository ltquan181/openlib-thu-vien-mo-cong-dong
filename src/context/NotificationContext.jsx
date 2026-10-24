import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storageService } from '../services/storageService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const calculateNotifications = useCallback(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const txs = storageService.getTransactions();
    const readIds = storageService.getReadNotifications(currentUser.id);
    const notifs = [];
    const today = new Date();

    txs.forEach((tx) => {
      // 1. Yêu cầu trao đổi đang chờ tôi duyệt
      if (tx.type === 'exchange' && tx.status === 'pending' && (tx.ownerA_Id === currentUser.id || tx.ownerA_Username === currentUser.username)) {
        notifs.push({
          id: `notif_exch_req_${tx.id}`,
          type: 'exchange_request',
          title: 'Yêu cầu trao đổi mới',
          message: `@${tx.ownerB_Username} đề nghị đổi sách "${tx.bookTitleB}" lấy cuốn "${tx.bookTitleA}" của bạn.`,
          date: tx.requestDate,
          txId: tx.id,
          targetTab: 'pending',
          priority: 'high'
        });
      }

      // 2. Yêu cầu gia hạn đang chờ tôi duyệt
      if (tx.extendRequested) {
        const isOwnerInBorrow = tx.type === 'borrow' && (tx.ownerId === currentUser.id || tx.ownerUsername === currentUser.username);
        const isPartnerInExchange = tx.type === 'exchange' && (tx.ownerA_Id === currentUser.id || tx.ownerB_Id === currentUser.id);

        if (isOwnerInBorrow || isPartnerInExchange) {
          notifs.push({
            id: `notif_ext_req_${tx.id}`,
            type: 'extension_request',
            title: 'Yêu cầu xin gia hạn',
            message: `Đối tác xin gia hạn thêm 7 ngày cho giao dịch "${tx.bookTitle || tx.bookTitleA}".`,
            date: tx.dueDate,
            txId: tx.id,
            targetTab: 'active',
            priority: 'medium'
          });
        }
      }

      // 3. Sách tôi mượn sắp đến hạn (<= 2 ngày) hoặc quá hạn
      if (tx.type === 'borrow' && tx.status === 'active' && (tx.borrowerId === currentUser.id || tx.borrowerUsername === currentUser.username)) {
        const due = new Date(tx.dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          notifs.push({
            id: `notif_overdue_${tx.id}`,
            type: 'overdue',
            title: 'Sách đã quá hạn trả!',
            message: `Cuốn "${tx.bookTitle}" đã quá hạn trả ${Math.abs(diffDays)} ngày. Hãy trả ngay để tránh bị phạt điểm và trừ uy tín!`,
            date: tx.dueDate,
            txId: tx.id,
            targetTab: 'active',
            priority: 'urgent'
          });
        } else if (diffDays <= 2) {
          notifs.push({
            id: `notif_due_soon_${tx.id}`,
            type: 'due_soon',
            title: 'Sách sắp đến hạn trả',
            message: `Cuốn "${tx.bookTitle}" chỉ còn ${diffDays} ngày nữa là đến hạn trả (${tx.dueDate}).`,
            date: tx.dueDate,
            txId: tx.id,
            targetTab: 'active',
            priority: 'warning'
          });
        }
      }

      // 4. Sách của tôi đang được người khác mượn
      if (tx.type === 'borrow' && tx.status === 'active' && (tx.ownerId === currentUser.id || tx.ownerUsername === currentUser.username)) {
        notifs.push({
          id: `notif_borrowed_out_${tx.id}`,
          type: 'borrowed_out',
          title: 'Sách đang cho mượn',
          message: `Độc giả @${tx.borrowerUsername} đang mượn cuốn "${tx.bookTitle}" của bạn (Hạn trả: ${tx.dueDate}).`,
          date: tx.borrowDate,
          txId: tx.id,
          targetTab: 'active',
          priority: 'low'
        });
      }

      // 5. Giao dịch trao đổi đang hoạt động
      if (tx.type === 'exchange' && tx.status === 'active' && (tx.ownerA_Id === currentUser.id || tx.ownerB_Id === currentUser.id)) {
        const isA = tx.ownerA_Id === currentUser.id;
        const partnerUsername = isA ? tx.ownerB_Username : tx.ownerA_Username;
        const myBook = isA ? tx.bookTitleA : tx.bookTitleB;
        const theirBook = isA ? tx.bookTitleB : tx.bookTitleA;
        notifs.push({
          id: `notif_exch_active_${tx.id}`,
          type: 'exchange_active',
          title: 'Đang trao đổi sách',
          message: `Bạn đang đổi cuốn "${myBook}" lấy "${theirBook}" với @${partnerUsername} (Hạn trả: ${tx.dueDate}).`,
          date: tx.startDate || tx.requestDate,
          txId: tx.id,
          targetTab: 'active',
          priority: 'medium'
        });
      }
    });

    // Mark read/unread
    const listWithReadStatus = notifs.map((n) => ({
      ...n,
      isRead: readIds.includes(n.id)
    }));

    const unread = listWithReadStatus.filter((n) => !n.isRead).length;
    setNotifications(listWithReadStatus);
    setUnreadCount(unread);
  }, [currentUser]);

  useEffect(() => {
    calculateNotifications();
  }, [calculateNotifications]);

  const markAllAsRead = () => {
    if (!currentUser) return;
    const allIds = notifications.map((n) => n.id);
    storageService.saveReadNotifications(currentUser.id, allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markNotificationAsRead = (id) => {
    if (!currentUser) return;
    const readIds = storageService.getReadNotifications(currentUser.id);
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      storageService.saveReadNotifications(currentUser.id, updated);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markNotificationAsRead,
        refreshNotifications: calculateNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
