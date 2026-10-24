import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  KeyRound, 
  Save, 
  ShieldAlert, 
  BookOpen, 
  BookmarkCheck, 
  ArrowLeftRight,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword, openAuth } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-xs text-slate-500 mb-6">Bạn cần đăng nhập để quản lý thông tin tài khoản cá nhân.</p>
        <button
          onClick={() => openAuth('login')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Profile fields state
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Stats calculation
  const allBooks = storageService.getBooks();
  const allTxs = storageService.getTransactions();

  const ownedBooksCount = allBooks.filter(b => b.ownerId === currentUser.id).length;
  const currentlyBorrowingCount = allTxs.filter(
    t => t.type === 'borrow' && t.status === 'active' && t.borrowerId === currentUser.id
  ).length;
  const currentlyLendingCount = allTxs.filter(
    t => t.type === 'borrow' && t.status === 'active' && t.ownerId === currentUser.id
  ).length;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      updateProfile(displayName, email, phone);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }
    try {
      changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
          Cài đặt & Thông tin Cá nhân
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý tài khoản, mật khẩu bảo mật và thông tin thành viên thư viện.
        </p>
      </div>

      {/* 3 Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Sách sở hữu</span>
            <strong className="text-lg font-bold text-slate-800">{ownedBooksCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Đang mượn</span>
            <strong className="text-lg font-bold text-slate-800">{currentlyBorrowingCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cho mượn</span>
            <strong className="text-lg font-bold text-slate-800">{currentlyLendingCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Vi phạm</span>
            <strong className="text-lg font-bold text-rose-600">{currentUser.violations || 0} / 3</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: BASIC INFORMATION */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-800">Thông tin cơ bản</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên tài khoản (Không thể đổi)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.username}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ngày tham gia</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.joinedDate ? (currentUser.joinedDate.includes('-') && currentUser.joinedDate.startsWith('2026') ? currentUser.joinedDate.split('-').reverse().join('-') : currentUser.joinedDate) : '23-04-2026'}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên hiển thị công khai</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Họ và tên..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CARD 2: CHANGE PASSWORD */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-700" />
              <h3 className="font-bold text-sm text-slate-800">Đổi mật khẩu bảo mật</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới (≥ 6 ký tự)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Xác nhận cập nhật mật khẩu</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            💡 Mẹo: Mật khẩu an toàn nên kết hợp giữa chữ cái, số và ký tự đặc biệt để bảo vệ ví điểm và dữ liệu cá nhân của bạn.
          </div>
        </div>

      </div>

    </div>
  );
}
