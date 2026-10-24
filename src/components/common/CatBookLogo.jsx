import React from 'react';
import { getAssetUrl } from '../../utils/assetHelper';

/**
 * CatBookLogo Component
 * Logo chú mèo trắng cam (Ginger & White Cat) cuộn mình ngủ say sưa trên chồng sách tri thức.
 * Bản tinh chỉnh hoàn thiện: đường cong mượt mà, không vằn, không vòng cổ, đồng bộ nhận diện OpenLib.
 */
export default function CatBookLogo({ className = "w-10 h-10", animated = true }) {
  const logoSrc = getAssetUrl('cat_book_logo.png');

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="OpenLib Cat Book Logo"
        className={`w-full h-full object-contain drop-shadow-sm transition-transform duration-300 ${
          animated ? 'hover:scale-105 active:scale-95' : ''
        }`}
        loading="eager"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getAssetUrl('images/logo/Logo_Meo_Trang_Cam_Chong_Sach.png');
        }}
      />
    </div>
  );
}
