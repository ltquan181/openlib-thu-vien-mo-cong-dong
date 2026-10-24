import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Helper to format book from DB
function formatBook(row) {
  if (!row) return null;
  let readingContent = null;
  if (row.readingContent) {
    try {
      readingContent = typeof row.readingContent === 'string' ? JSON.parse(row.readingContent) : row.readingContent;
    } catch {
      readingContent = null;
    }
  }
  return {
    ...row,
    readingContent
  };
}

// ----------------------------------------------------
// 0. HEALTH CHECK
// ----------------------------------------------------
router.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as isAlive');
    res.json({ status: 'ok', database: 'MySQL 8.0 (Docker)', alive: rows[0].isAlive === 1 });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------
// 1. BOOKS APIS
// ----------------------------------------------------
router.get('/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY (ownerUsername = "lethanhquan") DESC, created_at DESC');
    res.json(rows.map(formatBook));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books', async (req, res) => {
  try {
    const book = req.body;
    if (!book.title || !book.author) {
      return res.status(400).json({ error: 'Tiêu đề và tác giả là bắt buộc' });
    }

    // Duplicate check
    const [dups] = await pool.query(
      'SELECT id FROM books WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(author)) = LOWER(TRIM(?))',
      [book.title, book.author]
    );
    if (dups.length > 0) {
      return res.status(409).json({ error: 'Sách này đã tồn tại trong thư viện cộng đồng!' });
    }

    const id = book.id || `book_${Date.now()}`;
    const readingContentStr = book.readingContent ? JSON.stringify(book.readingContent) : null;

    await pool.query(`
      INSERT INTO books (id, title, author, category, format, type, coverImage, coverBg, description, ownerId, ownerUsername, ownerName, status, fileUrl, fileName, readingContent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, book.title, book.author, book.category || 'Văn học hiện đại', book.format || 'PDF', book.type || 'borrow',
      book.coverImage || '/images/books/default-cover.jpg', book.coverBg || 'from-emerald-700 to-teal-900',
      book.description || '', book.ownerId, book.ownerUsername, book.ownerName, 'available',
      book.fileUrl || '', book.fileName || '', readingContentStr
    ]);

    // Reward points for sharing book (+15)
    if (book.ownerId) {
      await pool.query('UPDATE users SET points = points + 15 WHERE id = ?', [book.ownerId]);
      await pool.query(`
        INSERT INTO point_history (id, userId, type, title, points, timestamp)
        VALUES (?, ?, 'upload_book', ?, 15, NOW())
      `, [`pt_${Date.now()}`, book.ownerId, `Đóng góp sách mới: ${book.title}`]);
    }

    const [created] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    res.status(201).json(formatBook(created[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(updates)) {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(key === 'readingContent' ? JSON.stringify(val) : val);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    res.json(formatBook(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. PINS APIS
// ----------------------------------------------------
router.get('/pins', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pins ORDER BY (authorUsername = "lethanhquan") DESC, created_at DESC');
    res.json(rows.map(p => ({ ...p, allowDownload: Boolean(p.allowDownload) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pins', async (req, res) => {
  try {
    const pin = req.body;
    if (!pin.title || !pin.imageUrl) {
      return res.status(400).json({ error: 'Tiêu đề và đường dẫn ảnh là bắt buộc' });
    }

    // Duplicate check
    const [dups] = await pool.query(
      'SELECT id FROM pins WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) OR imageUrl = ?',
      [pin.title, pin.imageUrl]
    );
    if (dups.length > 0) {
      return res.status(409).json({ error: 'Ảnh này đã tồn tại trong Kho ảnh cộng đồng!' });
    }

    const id = pin.id || `pin_${Date.now()}`;
    await pool.query(`
      INSERT INTO pins (id, title, category, format, authorId, authorUsername, authorName, allowDownload, views, likes, downloads, imageUrl, aspectRatio, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
    `, [
      id, pin.title, pin.category || 'Nghệ thuật cổ điển', pin.format || 'JPG',
      pin.authorId, pin.authorUsername, pin.authorName, pin.allowDownload ? 1 : 0,
      pin.imageUrl, pin.aspectRatio || 'aspect-[3/4]', pin.description || '', pin.createdAt || new Date().toISOString().split('T')[0]
    ]);

    // Reward points for sharing pin (+10)
    if (pin.authorId) {
      await pool.query('UPDATE users SET points = points + 10 WHERE id = ?', [pin.authorId]);
      await pool.query(`
        INSERT INTO point_history (id, userId, type, title, points, timestamp)
        VALUES (?, ?, 'upload_pin', ?, 10, NOW())
      `, [`pt_${Date.now()}`, pin.authorId, `Đóng góp tác phẩm ảnh: ${pin.title}`]);
    }

    const [created] = await pool.query('SELECT * FROM pins WHERE id = ?', [id]);
    res.status(201).json({ ...created[0], allowDownload: Boolean(created[0].allowDownload) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike pin
router.post('/pins/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const [liked] = await pool.query('SELECT * FROM liked_pins WHERE userId = ? AND pinId = ?', [userId, id]);
    let isLiked = false;

    if (liked.length > 0) {
      await pool.query('DELETE FROM liked_pins WHERE userId = ? AND pinId = ?', [userId, id]);
      await pool.query('UPDATE pins SET likes = GREATEST(0, likes - 1) WHERE id = ?', [id]);
      isLiked = false;
    } else {
      await pool.query('INSERT INTO liked_pins (userId, pinId) VALUES (?, ?)', [userId, id]);
      await pool.query('UPDATE pins SET likes = likes + 1 WHERE id = ?', [id]);
      isLiked = true;
    }

    const [rows] = await pool.query('SELECT * FROM pins WHERE id = ?', [id]);
    res.json({ pin: { ...rows[0], allowDownload: Boolean(rows[0].allowDownload) }, isLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download increment
router.post('/pins/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE pins SET downloads = downloads + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT downloads FROM pins WHERE id = ?', [id]);
    res.json({ downloads: rows[0]?.downloads || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View increment
router.post('/pins/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE pins SET views = views + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT views FROM pins WHERE id = ?', [id]);
    res.json({ views: rows[0]?.views || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Liked pins by user
router.get('/liked-pins/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT pinId FROM liked_pins WHERE userId = ?', [userId]);
    res.json(rows.map(r => r.pinId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. USERS APIS
// ----------------------------------------------------
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, displayName, email, phone, points, violations, avatarBg, avatarText, joinedDate FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại!' });
    }
    const user = rows[0];
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác!' });
    }
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/register', async (req, res) => {
  try {
    const { username, displayName, email, password, phone } = req.body;
    if (!username || !displayName) {
      return res.status(400).json({ error: 'Tên đăng nhập và họ tên là bắt buộc!' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email || '']);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Tài khoản hoặc email đã được sử dụng!' });
    }

    const id = `user_${Date.now()}`;
    const avatarBg = 'bg-emerald-600';
    const avatarText = displayName.substring(0, 2).toUpperCase();
    const joinedDate = new Date().toISOString().split('T')[0];

    await pool.query(`
      INSERT INTO users (id, username, displayName, email, password, phone, points, violations, avatarBg, avatarText, joinedDate)
      VALUES (?, ?, ?, ?, ?, ?, 100, 0, ?, ?, ?)
    `, [id, username, displayName, email || '', password || '123456', phone || '', avatarBg, avatarText, joinedDate]);

    // Welcome bonus point record
    await pool.query(`
      INSERT INTO point_history (id, userId, type, title, points, timestamp)
      VALUES (?, ?, 'register', 'Đăng ký thành viên mới (+100 điểm thưởng)', 100, NOW())
    `, [`pt_${Date.now()}`, id]);

    const [newUser] = await pool.query('SELECT id, username, displayName, email, phone, points, violations, avatarBg, avatarText, joinedDate FROM users WHERE id = ?', [id]);
    res.status(201).json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. TRANSACTIONS APIS (BORROW / EXCHANGE / RETURN)
// ----------------------------------------------------
router.get('/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const tx = req.body;
    const id = tx.id || `tx_${Date.now()}`;

    await pool.query(`
      INSERT INTO transactions (
        id, type, status, bookId, bookTitle, bookCover, ownerId, ownerUsername, ownerName,
        borrowerId, borrowerUsername, borrowerName, bookIdA, bookTitleA, bookCoverA,
        ownerA_Id, ownerA_Username, ownerA_Name, bookIdB, bookTitleB, bookCoverB,
        ownerB_Id, ownerB_Username, ownerB_Name, startDate, dueDate, depositPoints, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, tx.type, 'active', tx.bookId || null, tx.bookTitle || null, tx.bookCover || null,
      tx.ownerId || null, tx.ownerUsername || null, tx.ownerName || null,
      tx.borrowerId || null, tx.borrowerUsername || null, tx.borrowerName || null,
      tx.bookIdA || null, tx.bookTitleA || null, tx.bookCoverA || null,
      tx.ownerA_Id || null, tx.ownerA_Username || null, tx.ownerA_Name || null,
      tx.bookIdB || null, tx.bookTitleB || null, tx.bookCoverB || null,
      tx.ownerB_Id || null, tx.ownerB_Username || null, tx.ownerB_Name || null,
      tx.startDate || new Date().toISOString().split('T')[0], tx.dueDate || null,
      tx.depositPoints || 0, tx.message || ''
    ]);

    // Update book status to not show in community feed
    if (tx.type === 'borrow' && tx.bookId) {
      await pool.query('UPDATE books SET status = "borrowed" WHERE id = ?', [tx.bookId]);
      
      // Update points
      if (tx.borrowerId) {
        await pool.query('UPDATE users SET points = points - ? WHERE id = ?', [tx.depositPoints || 10, tx.borrowerId]);
        await pool.query(`
          INSERT INTO point_history (id, userId, type, title, points, timestamp)
          VALUES (?, ?, 'borrow', ?, ?, NOW())
        `, [`pt_${Date.now()}_1`, tx.borrowerId, `Mượn sách: ${tx.bookTitle}`, -(tx.depositPoints || 10)]);
      }
      if (tx.ownerId) {
        await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [tx.depositPoints || 10, tx.ownerId]);
        await pool.query(`
          INSERT INTO point_history (id, userId, type, title, points, timestamp)
          VALUES (?, ?, 'lend', ?, ?, NOW())
        `, [`pt_${Date.now()}_2`, tx.ownerId, `Cho mượn sách: ${tx.bookTitle} (độc giả ${tx.borrowerName})`, tx.depositPoints || 10]);

        // Notification for owner with direct link metadata
        await pool.query(`
          INSERT INTO notifications (id, userId, title, message, type, read_status, data, timestamp)
          VALUES (?, ?, 'Có độc giả mượn sách của bạn', ?, 'borrow', 0, ?, NOW())
        `, [
          `notif_${Date.now()}`, tx.ownerId,
          `Độc giả ${tx.borrowerName} đã mượn cuốn sách "${tx.bookTitle}". Hạn trả: ${tx.dueDate}.`,
          JSON.stringify({
            type: 'borrow',
            bookId: tx.bookId,
            bookTitle: tx.bookTitle,
            borrowerName: tx.borrowerName,
            borrowerUsername: tx.borrowerUsername,
            borrowDate: tx.startDate,
            dueDate: tx.dueDate,
            txId: id
          })
        ]);
      }
    } else if (tx.type === 'exchange') {
      if (tx.bookIdA) await pool.query('UPDATE books SET status = "exchanged" WHERE id = ?', [tx.bookIdA]);
      if (tx.bookIdB) await pool.query('UPDATE books SET status = "exchanged" WHERE id = ?', [tx.bookIdB]);
      
      // Notification for partner
      if (tx.ownerA_Id) {
        await pool.query(`
          INSERT INTO notifications (id, userId, title, message, type, read_status, data, timestamp)
          VALUES (?, ?, 'Giao dịch trao đổi sách thành công', ?, 'exchange', 0, ?, NOW())
        `, [
          `notif_${Date.now()}`, tx.ownerA_Id,
          `Bạn và ${tx.ownerB_Name} đã trao đổi thành công hai cuốn sách "${tx.bookTitleA}" và "${tx.bookTitleB}".`,
          JSON.stringify({
            type: 'exchange',
            bookTitle: tx.bookTitleA,
            exchangeWithTitle: tx.bookTitleB,
            partnerName: tx.ownerB_Name,
            partnerUsername: tx.ownerB_Username,
            borrowDate: tx.startDate,
            dueDate: tx.dueDate,
            txId: id
          })
        ]);
      }
    }

    const [created] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return book
router.put('/transactions/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const [txRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (txRows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    const tx = txRows[0];

    const returnDate = new Date().toISOString().split('T')[0];
    await pool.query('UPDATE transactions SET status = "returned", returnDate = ? WHERE id = ?', [returnDate, id]);

    // Restore book status to available
    if (tx.type === 'borrow' && tx.bookId) {
      await pool.query('UPDATE books SET status = "available" WHERE id = ?', [tx.bookId]);
      
      // Notify owner
      if (tx.ownerId) {
        await pool.query(`
          INSERT INTO notifications (id, userId, title, message, type, read_status, data, timestamp)
          VALUES (?, ?, 'Sách đã được trả lại', ?, 'return', 0, ?, NOW())
        `, [
          `notif_${Date.now()}`, tx.ownerId,
          `Độc giả ${tx.borrowerName} đã hoàn trả cuốn sách "${tx.bookTitle}". Sách đã sẵn sàng hiển thị lại trên Kho sách cộng đồng.`,
          JSON.stringify({
            type: 'return',
            bookId: tx.bookId,
            bookTitle: tx.bookTitle,
            borrowerName: tx.borrowerName,
            txId: id
          })
        ]);
      }
    } else if (tx.type === 'exchange') {
      if (tx.bookIdA) await pool.query('UPDATE books SET status = "available" WHERE id = ?', [tx.bookIdA]);
      if (tx.bookIdB) await pool.query('UPDATE books SET status = "available" WHERE id = ?', [tx.bookIdB]);
    }

    const [updated] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. POINTS HISTORY & NOTIFICATIONS APIS
// ----------------------------------------------------
router.get('/points/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM point_history WHERE userId = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM notifications WHERE userId = ? ORDER BY created_at DESC', [userId]);
    res.json(rows.map(n => ({
      ...n,
      read: Boolean(n.read_status),
      data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET read_status = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query('UPDATE notifications SET read_status = 1 WHERE userId = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. COMMENTS APIS
// ----------------------------------------------------
router.get('/comments/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE targetType = ? AND targetId = ? ORDER BY created_at DESC',
      [targetType, targetId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/comments', async (req, res) => {
  try {
    const comment = req.body;
    const id = comment.id || `c_${Date.now()}`;
    await pool.query(`
      INSERT INTO comments (id, targetType, targetId, userId, username, name, avatar, content, rating, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, comment.targetType, comment.targetId, comment.userId, comment.username,
      comment.name, comment.avatar || '', comment.content, comment.rating || 5,
      comment.timestamp || new Date().toISOString()
    ]);
    const [created] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
