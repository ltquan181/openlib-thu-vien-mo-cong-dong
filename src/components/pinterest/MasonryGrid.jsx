import React from 'react';
import PinCard from './PinCard';

export default function MasonryGrid({ pins, onOpenDetail, onQuickDownload, onLike }) {
  if (!pins || pins.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          🖼️
        </div>
        <h3 className="text-sm font-bold text-slate-700">Chưa có tranh ảnh nào</h3>
        <p className="text-xs text-slate-500 mt-1">Hãy là người đầu tiên chia sẻ tác phẩm nghệ thuật lên cộng đồng!</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid w-full">
      {pins.map((pin) => (
        <PinCard
          key={pin.id}
          pin={pin}
          onOpenDetail={onOpenDetail}
          onQuickDownload={onQuickDownload}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
