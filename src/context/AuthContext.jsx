import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { pointService } from '../services/pointService';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const { showToast } = useToast();

  useEffect(() => {
    storageService.initStorage();
    const user = storageService.getCurrentUser();
    setCurrentUser(user);

    const handlePointsUpdated = () => {
      const refreshed = storageService.getCurrentUser();
      setCurrentUser(refreshed ? { ...refreshed } : null);
    };

    window.addEventListener('openlib_points_updated', handlePointsUpdated);
    return () => window.removeEventListener('openlib_points_updated', handlePointsUpdated);
  }, []);

  const refreshUser = () => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user ? { ...user } : null);
  };

  const login = (usernameOrEmail, password) => {
    const users = storageService.getUsers();
    const term = usernameOrEmail.trim().toLowerCase();

    const user = users.find(
      (u) => (u.username.toLowerCase() === term || u.email.toLowerCase() === term) && u.password === password
    );

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    storageService.saveCurrentUser(user);
    try { localStorage.setItem('openlib_user_authenticated', 'true'); } catch {}
    setCurrentUser(user);
    showToast(`Chào mừng ${user.displayName || user.username} đã quay trở lại!`, 'success');
    setIsAuthModalOpen(false);
    return user;
  };

  const register = (username, email, password, confirmPassword) => {
    const uName = username.trim().toLowerCase();
    const uEmail = email.trim().toLowerCase();

    if (!uName || !uEmail || !password) {
      throw new Error('Vui lòng điền đầy đủ các trường thông tin.');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có tối thiểu 6 ký tự.');
    }

    if (password !== confirmPassword) {
      throw new Error('Mật khẩu xác nhận không khớp.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uEmail)) {
      throw new Error('Định dạng email không hợp lệ.');
    }

    const users = storageService.getUsers();
    if (users.some((u) => u.username.toLowerCase() === uName)) {
      throw new Error('Tên tài khoản đã tồn tại.');
    }

    if (users.some((u) => u.email.toLowerCase() === uEmail)) {
      throw new Error('Email đã được đăng ký.');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      username: uName,
      email: uEmail,
      password: password,
      displayName: username.trim(),
      phone: '',
      points: 100, // +100 points upon registration
      violations: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      avatarBg: 'bg-indigo-600',
      avatarText: uName.charAt(0).toUpperCase()
    };

    users.push(newUser);
    storageService.saveUsers(users);

    // Record +100 points in history
    pointService.addPoints(newUser.id, 100, 'register', 'Thưởng gia nhập cộng đồng OpenLib');

    storageService.saveCurrentUser(newUser);
    try { localStorage.setItem('openlib_user_authenticated', 'true'); } catch {}
    setCurrentUser(newUser);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch {}

    showToast('Đăng ký thành công! Bạn nhận ngay 100 điểm thưởng 🎉', 'success');
    setIsAuthModalOpen(false);
    return newUser;
  };

  const forgotPassword = (email, newPassword, confirmPassword) => {
    const uEmail = email.trim().toLowerCase();

    if (!uEmail || !newPassword) {
      throw new Error('Vui lòng điền đầy đủ thông tin.');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Xác nhận mật khẩu mới không khớp.');
    }

    const users = storageService.getUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === uEmail);

    if (userIndex === -1) {
      throw new Error('Email không tồn tại trong hệ thống.');
    }

    users[userIndex].password = newPassword;
    storageService.saveUsers(users);

    showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');
    setAuthModalTab('login');
    return true;
  };

  const updateProfile = (displayName, email, phone) => {
    if (!currentUser) throw new Error('Chưa đăng nhập.');

    const uEmail = email.trim().toLowerCase();
    const users = storageService.getUsers();

    if (users.some((u) => u.id !== currentUser.id && u.email.toLowerCase() === uEmail)) {
      throw new Error('Email này đã được sử dụng bởi người dùng khác.');
    }

    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].displayName = displayName.trim();
      users[userIndex].email = uEmail;
      users[userIndex].phone = phone.trim();
      storageService.saveUsers(users);

      storageService.saveCurrentUser(users[userIndex]);
      setCurrentUser({ ...users[userIndex] });
      showToast('Cập nhật hồ sơ thành công!', 'success');
    }
  };

  const changePassword = (oldPassword, newPassword) => {
    if (!currentUser) throw new Error('Chưa đăng nhập.');

    const users = storageService.getUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex === -1 || users[userIndex].password !== oldPassword) {
      throw new Error('Mật khẩu hiện tại không chính xác.');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }

    users[userIndex].password = newPassword;
    storageService.saveUsers(users);
    storageService.saveCurrentUser(users[userIndex]);
    setCurrentUser({ ...users[userIndex] });
    showToast('Đổi mật khẩu thành công!', 'success');
  };

  const logout = () => {
    try { localStorage.removeItem('openlib_user_authenticated'); } catch {}
    storageService.saveCurrentUser(null);
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản.', 'info');
    // Tự động làm mới lại trang web khi đăng xuất và quay về trang chủ
    setTimeout(() => {
      window.location.hash = '#/community';
      window.location.reload();
    }, 150);
  };

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuth,
        login,
        register,
        forgotPassword,
        updateProfile,
        changePassword,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
