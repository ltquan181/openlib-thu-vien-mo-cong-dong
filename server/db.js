import mysql from 'mysql2/promise';
import { INITIAL_BOOKS } from '../src/data/seedBooks.js';
import { INITIAL_PINS } from '../src/data/seedPins.js';
import { INITIAL_USERS } from '../src/data/seedUsers.js';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'openlib',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Đang khởi tạo cấu trúc bảng MySQL cho OpenLib...');

    // 1. Table users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        displayName VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) DEFAULT '123456',
        phone VARCHAR(50),
        points INT DEFAULT 100,
        violations INT DEFAULT 0,
        avatarBg VARCHAR(50),
        avatarText VARCHAR(50),
        joinedDate VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Table books
    await conn.query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        format VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'borrow',
        coverImage TEXT,
        coverBg VARCHAR(100),
        description TEXT,
        ownerId VARCHAR(50) NOT NULL,
        ownerUsername VARCHAR(100) NOT NULL,
        ownerName VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'available',
        fileUrl TEXT,
        fileName VARCHAR(255),
        readingContent LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Table pins
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pins (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        format VARCHAR(20) NOT NULL,
        authorId VARCHAR(50) NOT NULL,
        authorUsername VARCHAR(100) NOT NULL,
        authorName VARCHAR(255) NOT NULL,
        allowDownload BOOLEAN DEFAULT TRUE,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        downloads INT DEFAULT 0,
        imageUrl TEXT NOT NULL,
        aspectRatio VARCHAR(50) DEFAULT 'aspect-[3/4]',
        description TEXT,
        createdAt VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Table transactions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        bookId VARCHAR(50),
        bookTitle VARCHAR(255),
        bookCover TEXT,
        ownerId VARCHAR(50),
        ownerUsername VARCHAR(100),
        ownerName VARCHAR(255),
        borrowerId VARCHAR(50),
        borrowerUsername VARCHAR(100),
        borrowerName VARCHAR(255),
        bookIdA VARCHAR(50),
        bookTitleA VARCHAR(255),
        bookCoverA TEXT,
        ownerA_Id VARCHAR(50),
        ownerA_Username VARCHAR(100),
        ownerA_Name VARCHAR(255),
        bookIdB VARCHAR(50),
        bookTitleB VARCHAR(255),
        bookCoverB TEXT,
        ownerB_Id VARCHAR(50),
        ownerB_Username VARCHAR(100),
        ownerB_Name VARCHAR(255),
        startDate VARCHAR(50),
        dueDate VARCHAR(50),
        returnDate VARCHAR(50),
        depositPoints INT DEFAULT 0,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Table point_history
    await conn.query(`
      CREATE TABLE IF NOT EXISTS point_history (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        points INT NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Table liked_pins
    await conn.query(`
      CREATE TABLE IF NOT EXISTS liked_pins (
        userId VARCHAR(50) NOT NULL,
        pinId VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, pinId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Table notifications
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read_status BOOLEAN DEFAULT FALSE,
        data JSON,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Table comments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(50) PRIMARY KEY,
        targetType VARCHAR(20) NOT NULL,
        targetId VARCHAR(50) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        content TEXT NOT NULL,
        rating INT DEFAULT 5,
        timestamp VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // --- SEED USERS IF EMPTY ---
    const [userRows] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Đang nạp danh sách thành viên cộng đồng vào MySQL...');
      for (const u of INITIAL_USERS) {
        await conn.query(`
          INSERT INTO users (id, username, displayName, email, password, phone, points, violations, avatarBg, avatarText, joinedDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          u.id, u.username, u.displayName, u.email || '', u.password || '123456',
          u.phone || '', u.points || 100, u.violations || 0, u.avatarBg || 'bg-emerald-600',
          u.avatarText || u.displayName.substring(0, 2).toUpperCase(), u.joinedDate || '2026-04-20'
        ]);
      }
    }

    // --- SEED BOOKS IF EMPTY ---
    const [bookRows] = await conn.query('SELECT COUNT(*) as count FROM books');
    if (bookRows[0].count === 0) {
      console.log('🌱 Đang nạp 31 đầu sách cộng đồng vào MySQL...');
      for (const b of INITIAL_BOOKS) {
        await conn.query(`
          INSERT INTO books (id, title, author, category, format, type, coverImage, coverBg, description, ownerId, ownerUsername, ownerName, status, fileUrl, fileName, readingContent)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          b.id, b.title, b.author, b.category, b.format, b.type, b.coverImage, b.coverBg, b.description,
          b.ownerId, b.ownerUsername, b.ownerName, b.status || 'available', b.fileUrl || '', b.fileName || '',
          b.readingContent ? JSON.stringify(b.readingContent) : null
        ]);
      }
    }

    // --- SEED PINS IF EMPTY ---
    const [pinRows] = await conn.query('SELECT COUNT(*) as count FROM pins');
    if (pinRows[0].count === 0) {
      console.log('🌱 Đang nạp 71 tác phẩm tranh/ảnh vào MySQL...');
      for (const p of INITIAL_PINS) {
        await conn.query(`
          INSERT INTO pins (id, title, category, format, authorId, authorUsername, authorName, allowDownload, views, likes, downloads, imageUrl, aspectRatio, description, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id, p.title, p.category, p.format, p.authorId, p.authorUsername, p.authorName,
          p.allowDownload ? 1 : 0, p.views || 0, p.likes || 0, p.downloads || 0,
          p.imageUrl, p.aspectRatio || 'aspect-[3/4]', p.description || '', p.createdAt || '2026-04-18'
        ]);
      }
    }

    // --- SEED INITIAL DEMO TRANSACTIONS IF EMPTY ---
    const [txRows] = await conn.query('SELECT COUNT(*) as count FROM transactions');
    if (txRows[0].count === 0) {
      console.log('🌱 Đang nạp dữ liệu giao dịch mẫu vào MySQL...');
      await conn.query(`
        INSERT INTO transactions (id, type, status, bookId, bookTitle, bookCover, ownerId, ownerUsername, ownerName, borrowerId, borrowerUsername, borrowerName, startDate, dueDate, depositPoints, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'tx_demo_1', 'borrow', 'active', 'book_ngan_nam_ao_mu', 'Ngàn Năm Áo Mũ: Lịch Sử Trang Phục Việt Nam',
        '/images/books/ngan-nam-ao-mu-cover.jpg', 'user_1', 'lethanhquan', 'Thanh Quân',
        'user_vanbach', 'vanbach', 'Văn Bách', '2026-10-14', '2026-10-28', 10,
        'Cảm ơn bạn Thanh Quân đã cho mình mượn cuốn sách nghiên cứu trang phục quý giá này!'
      ]);

      // Seed initial points
      await conn.query(`
        INSERT INTO point_history (id, userId, type, title, points, timestamp)
        VALUES 
        ('pt_1', 'user_1', 'register', 'Đăng ký thành viên mới', 100, '2026-10-14T09:00:00Z'),
        ('pt_2', 'user_1', 'lend', 'Cho mượn sách: Ngàn Năm Áo Mũ (độc giả Văn Bách)', 10, '2026-10-14T09:30:00Z'),
        ('pt_3', 'user_vanbach', 'borrow', 'Mượn sách: Ngàn Năm Áo Mũ', -10, '2026-10-14T09:30:00Z')
      `);

      // Seed initial notification for lethanhquan
      await conn.query(`
        INSERT INTO notifications (id, userId, title, message, type, read_status, data, timestamp)
        VALUES (
          'notif_demo_1', 'user_1', 'Có độc giả mượn sách của bạn',
          'Độc giả Văn Bách đã mượn cuốn sách Ngàn Năm Áo Mũ của bạn. Hạn trả: 28/10/2026.',
          'borrow', 0, ?, '2026-10-14T09:30:00Z'
        )
      `, [JSON.stringify({
        type: 'borrow',
        bookId: 'book_ngan_nam_ao_mu',
        bookTitle: 'Ngàn Năm Áo Mũ: Lịch Sử Trang Phục Việt Nam',
        borrowerName: 'Văn Bách',
        borrowerUsername: 'vanbach',
        borrowDate: '2026-10-14',
        dueDate: '2026-10-28',
        txId: 'tx_demo_1'
      })]);
    }

    console.log('✅ Khởi tạo và đồng bộ Database MySQL thành công!');
  } finally {
    conn.release();
  }
}
