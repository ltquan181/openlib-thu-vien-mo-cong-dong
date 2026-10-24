import React from 'react';
import { 
  Library, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Award, 
  Heart,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import CatBookLogo from './CatBookLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full bg-[#042017] text-emerald-100/90 border-t border-emerald-900/50 pt-14 pb-8 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-emerald-900/40 text-left">
          
          {/* Column 1: Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950/90 border border-emerald-800/60 flex items-center justify-center shadow-lg shadow-emerald-950 shrink-0 p-1">
                <CatBookLogo className="w-full h-full" animated={false} />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white flex items-center">
                  Open<span className="text-emerald-400">Lib</span>
                </span>
                <span className="block text-[10px] font-black text-emerald-400/90 tracking-wider uppercase">
                  THƯ VIỆN MỞ CỘNG ĐỒNG
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/70 leading-relaxed font-normal">
              Nền tảng chia sẻ và mượn trả tài liệu phi lợi nhuận, kết nối bạn đọc yêu tri thức, hỗ trợ đọc sách online trực tiếp và lan tỏa văn hóa đọc đến mọi miền.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-300/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">Cộng đồng P2P Văn minh & Tin cậy</span>
            </div>
          </div>

          {/* Column 2: Khám phá thư viện */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Khám phá thư viện</span>
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/70">
              <li>
                <button 
                  onClick={() => onNavigate('#/community')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-300 transition-colors" />
                  <span>Tủ sách cộng đồng (Đọc online)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('#/community')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-300 transition-colors" />
                  <span>Kho ảnh cộng đồng</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('#/my-library')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-300 transition-colors" />
                  <span>Thư viện của tôi (Sách & Ảnh)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('#/transactions')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-300 transition-colors" />
                  <span>Giỏ sách cộng đồng</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Điểm thưởng & Chính sách */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Chính sách & Quy định</span>
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/70">
              <li>
                <button 
                  onClick={() => onNavigate('#/points')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400/50 group-hover:text-emerald-300 transition-colors" />
                  <span>Điểm cộng đồng (Thưởng +15đ, Mượn 10đ)</span>
                </button>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-emerald-300/80">
                  <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                  <span>Thời hạn mượn mặc định: 07 ngày</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-emerald-300/80">
                  <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                  <span>Trao đổi 2 chiều: +5đ mỗi bên</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-emerald-300/80">
                  <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                  <span>Đọc online: Miễn phí cho sách sở hữu</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-emerald-300/80">
                  <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                  <span>Cam kết tôn trọng bản quyền tác giả</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information (Exact details requested) */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Thông tin liên hệ</span>
            </h4>
            
            <div className="space-y-2.5 text-xs text-emerald-200/85">
              
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Địa chỉ:</span>
                  <span className="leading-snug opacity-90">123 Đường ABC, Quận XYZ, TP.HÀ NỘI</span>
                </div>
              </div>

              {/* Phone Hotline */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white mr-1.5">Liên hệ:</span>
                  <a 
                    href="tel:02812345678" 
                    className="font-mono text-emerald-300 hover:text-white transition-colors font-bold"
                  >
                    (028) 1234 5678
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white mr-1.5">Email:</span>
                  <a 
                    href="mailto:info@openlib.com.vn" 
                    className="text-emerald-300 hover:text-white transition-colors underline underline-offset-2"
                  >
                    info@openlib.com.vn
                  </a>
                </div>
              </div>

              {/* Working hours */}
              <div className="flex items-center gap-2.5 pt-1 text-[11px] text-emerald-300/70">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Trực tuyến 24/7 · Hỗ trợ bạn đọc tận tâm</span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Copyright & Notes */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-300/60 text-center sm:text-left">
          <p>
            © 2026 <strong>OpenLib</strong> — Thư viện Mở Cộng đồng. Phi lợi nhuận & Lan tỏa tri thức.
          </p>
          <div className="flex items-center gap-1 text-emerald-200/70">
            <span>Được thiết kế vì tình yêu sách và văn hóa đọc</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-0.5" />
          </div>
        </div>

      </div>
    </footer>
  );
}
