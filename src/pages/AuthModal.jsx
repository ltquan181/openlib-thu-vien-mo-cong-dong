import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setAuthModalTab, login, register, forgotPassword } = useAuth();
  const { showToast } = useToast();

  // Login form state
  const [loginTerm, setLoginTerm] = useState('lethanhquan');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    try {
      login(loginTerm, loginPassword);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    try {
      register(regUsername, regEmail, regPassword, regConfirmPassword);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    try {
      forgotPassword(forgotEmail, forgotNewPassword, forgotConfirmPassword);
      setLoginTerm(forgotEmail);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header / Tabs */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between border-b border-slate-100">
          {authModalTab === 'forgot' ? (
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-700" />
              <h3 className="font-bold text-base text-slate-900">Đặt lại mật khẩu</h3>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  authModalTab === 'login'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  authModalTab === 'register'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng ký (+100đ)
              </button>
            </div>
          )}

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-left">
          
          {/* TAB 1: LOGIN */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tài khoản / Email</label>
                <input
                  type="text"
                  required
                  value={loginTerm}
                  onChange={(e) => setLoginTerm(e.target.value)}
                  placeholder="user_name hoặc email"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('forgot')}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
              </div>

              {/* Demo Hint */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Tài khoản Demo thử nghiệm:</span>
                <span className="font-mono font-bold text-amber-800">lethanhquan / 123456</span>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tài khoản *</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="VD: minh_duc"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu (≥ 6 ký tự) *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-700/20 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo tài khoản & nhận 100 điểm</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email đăng ký *</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="thanhquan@gmail.com"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới (≥ 6 ký tự) *</label>
                <input
                  type="password"
                  required
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Xác nhận đổi mật khẩu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
                >
                  ← Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
