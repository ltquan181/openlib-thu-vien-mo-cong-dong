const COMMENTS_KEY = 'openlib_comments';

const INITIAL_COMMENTS = [
  {
    id: 'cm_1',
    targetId: 'book_1', // Truyện Kiều
    userId: 'user_tienanh',
    username: 'tienanh',
    displayName: 'Tiến Anh',
    avatarBg: 'bg-indigo-600',
    avatarText: 'TA',
    rating: 5,
    content: 'Bản in rất rõ ràng, từng câu thơ lục bát của cụ Nguyễn Du đọc lại vẫn thấy bồi hồi và sâu sắc!',
    createdAt: '2026-03-12T14:30:00Z'
  },
  {
    id: 'cm_2',
    targetId: 'book_3', // Nhà Giả Kim
    userId: 'user_1',
    username: 'lethanhquan',
    displayName: 'Thanh Quân',
    avatarBg: 'bg-emerald-600',
    avatarText: 'TQ',
    rating: 5,
    content: 'Một cuốn sách thay đổi tư duy, nhắc nhở chúng ta không bao giờ từ bỏ ước mơ và vận mệnh của chính mình.',
    createdAt: '2026-03-16T09:15:00Z'
  },
  {
    id: 'cm_3',
    targetId: 'book_6', // Clean Code
    userId: 'user_quynhanh',
    username: 'quynhanh',
    displayName: 'Quỳnh Anh',
    avatarBg: 'bg-purple-600',
    avatarText: 'QA',
    rating: 5,
    content: 'Cẩm nang kinh điển cho bất cứ lập trình viên nào muốn viết mã nguồn sạch sẽ, dễ bảo trì.',
    createdAt: '2026-03-23T11:00:00Z'
  },
  {
    id: 'cm_4',
    targetId: 'pin_1', // Tranh Van Gogh Starry Night
    userId: 'user_1',
    username: 'lethanhquan',
    displayName: 'Thanh Quân',
    avatarBg: 'bg-emerald-600',
    avatarText: 'TQ',
    content: 'Nét cọ xoáy tuyệt đẹp, màu sắc tương phản giữa vàng kim và xanh đêm rất huyền ảo!',
    createdAt: '2026-03-18T16:20:00Z'
  }
];

export const commentService = {
  getComments(targetId) {
    try {
      const data = localStorage.getItem(COMMENTS_KEY);
      let allComments = data ? JSON.parse(data) : INITIAL_COMMENTS;
      if (!data) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
      } else {
        let changed = false;
        allComments = allComments.map(c => {
          if (c.username === 'nguyenvana') {
            changed = true;
            return { ...c, username: 'lethanhquan', displayName: 'Thanh Quân', avatarBg: 'bg-emerald-600', avatarText: 'TQ' };
          }
          if (c.username === 'tranthib') {
            changed = true;
            return { ...c, username: 'quynhanh', displayName: 'Quỳnh Anh', avatarBg: 'bg-purple-600', avatarText: 'QA' };
          }
          if (c.username === 'levanc') {
            changed = true;
            return { ...c, username: 'tienanh', displayName: 'Tiến Anh', avatarBg: 'bg-indigo-600', avatarText: 'TA' };
          }
          return c;
        });
        if (changed) {
          localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
        }
      }
      return allComments.filter((c) => c.targetId === targetId);
    } catch {
      return INITIAL_COMMENTS.filter((c) => c.targetId === targetId);
    }
  },

  addComment(targetId, user, content, rating = 5) {
    if (!content || !content.trim()) throw new Error('Vui lòng nhập nội dung bình luận.');

    const allComments = (() => {
      try {
        const data = localStorage.getItem(COMMENTS_KEY);
        return data ? JSON.parse(data) : INITIAL_COMMENTS;
      } catch {
        return INITIAL_COMMENTS;
      }
    })();

    const newComment = {
      id: 'cm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      targetId,
      userId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatarBg: user.avatarBg || 'bg-indigo-600',
      avatarText: (user.displayName || user.username).charAt(0).toUpperCase(),
      rating: rating || 5,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    allComments.unshift(newComment);
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    } catch (e) {
      console.error('Failed to save comment:', e);
    }

    return newComment;
  }
};
