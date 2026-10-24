import { storageService } from './storageService';
import { pointService } from './pointService';

export const bookService = {
  getBooks() {
    return storageService.getBooks();
  },

  getBookById(id) {
    const books = storageService.getBooks();
    return books.find(b => b.id === id);
  },

  borrowBook(bookId, user) {
    const book = this.getBookById(bookId);
    if (!book) throw new Error('Không tìm thấy sách.');

    const check = pointService.canBorrowBook(user, book);
    if (!check.allowed) throw new Error(check.reason);

    // Points transaction: borrower -10, owner +10 (Updated to 10 points per request)
    pointService.addPoints(user.id, -10, 'borrow', `Mượn sách: ${book.title}`);
    pointService.addPoints(book.ownerId, 10, 'lend', `Cho mượn sách: ${book.title}`);

    // Update book status
    const books = storageService.getBooks();
    const bIndex = books.findIndex(b => b.id === bookId);
    books[bIndex].status = 'borrowed';
    storageService.saveBooks(books);

    // Create active transaction
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 7);

    const txs = storageService.getTransactions();
    const newTx = {
      id: 'tx_' + Date.now(),
      type: 'borrow',
      bookId: book.id,
      bookTitle: book.title,
      borrowerId: user.id,
      borrowerUsername: user.username,
      borrowerName: user.displayName || user.username,
      ownerId: book.ownerId,
      ownerUsername: book.ownerUsername,
      ownerName: book.ownerName,
      status: 'active',
      borrowDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      extended: false,
      extendRequested: false,
      returnedByBorrower: false,
      confirmedByOwner: false,
    };
    txs.unshift(newTx);
    storageService.saveTransactions(txs);

    return newTx;
  },

  requestExchange(myBookId, targetBookId, user) {
    const check = pointService.canBorrowOrExchange(user);
    if (!check.allowed) throw new Error(check.reason);

    const myBook = this.getBookById(myBookId);
    const targetBook = this.getBookById(targetBookId);

    if (!myBook || !targetBook) throw new Error('Không tìm thấy sách yêu cầu.');
    if (myBook.ownerId !== user.id && myBook.ownerUsername !== user.username) {
      throw new Error('Sách này không thuộc quyền sở hữu của bạn.');
    }
    if (targetBook.ownerId === user.id || targetBook.ownerUsername === user.username) {
      throw new Error('Không thể trao đổi với chính sách của mình.');
    }

    const txs = storageService.getTransactions();
    const newTx = {
      id: 'tx_' + Date.now(),
      type: 'exchange',
      bookIdA: targetBook.id,
      bookTitleA: targetBook.title,
      ownerA_Id: targetBook.ownerId,
      ownerA_Username: targetBook.ownerUsername,
      ownerA_Name: targetBook.ownerName,
      bookIdB: myBook.id,
      bookTitleB: myBook.title,
      ownerB_Id: user.id,
      ownerB_Username: user.username,
      ownerB_Name: user.displayName || user.username,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      extended: false,
      extendRequested: false,
      returnedByA: false,
      returnedByB: false
    };

    txs.unshift(newTx);
    storageService.saveTransactions(txs);
    return newTx;
  },

  approveExchange(transactionId, user) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');
    if (tx.ownerA_Id !== user.id && tx.ownerA_Username !== user.username) {
      throw new Error('Bạn không có quyền duyệt yêu cầu này.');
    }

    // Both parties get +5 points immediately (Updated to +5 points each)
    pointService.addPoints(tx.ownerA_Id, 5, 'exchange', `Duyệt trao đổi sách: ${tx.bookTitleA} ⇄ ${tx.bookTitleB}`);
    pointService.addPoints(tx.ownerB_Id, 5, 'exchange', `Được chấp nhận trao đổi sách: ${tx.bookTitleB} ⇄ ${tx.bookTitleA}`);

    // Update transaction
    tx.status = 'active';
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 14); // 14 days
    tx.startDate = now.toISOString().split('T')[0];
    tx.dueDate = dueDate.toISOString().split('T')[0];
    storageService.saveTransactions(txs);

    // Update status of both books
    const books = storageService.getBooks();
    const bookA = books.find(b => b.id === tx.bookIdA);
    const bookB = books.find(b => b.id === tx.bookIdB);
    if (bookA) bookA.status = 'borrowed';
    if (bookB) bookB.status = 'borrowed';
    storageService.saveBooks(books);

    return tx;
  },

  rejectExchange(transactionId, user) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');
    if (tx.ownerA_Id !== user.id && tx.ownerA_Username !== user.username) {
      throw new Error('Bạn không có quyền từ chối yêu cầu này.');
    }

    tx.status = 'rejected';
    storageService.saveTransactions(txs);
    return tx;
  },

  returnBorrowBook(transactionId, user) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');

    const isOverdue = new Date(tx.dueDate) < new Date();
    if (isOverdue) {
      // Overdue penalty: borrower -10 & violation +1, owner +10
      pointService.addPoints(tx.borrowerId, -10, 'penalty', `Phạt quá hạn trả sách: ${tx.bookTitle}`);
      pointService.addViolation(tx.borrowerId, 'Trả sách quá hạn');
      pointService.addPoints(tx.ownerId, 10, 'compensation', `Bồi thường trả sách muộn: ${tx.bookTitle}`);
    }

    tx.status = 'returned';
    tx.returnDate = new Date().toISOString().split('T')[0];
    storageService.saveTransactions(txs);

    // Set book back to available
    const books = storageService.getBooks();
    const book = books.find(b => b.id === tx.bookId);
    if (book) {
      book.status = 'available';
      storageService.saveBooks(books);
    }

    return tx;
  },

  returnExchangeBook(transactionId, user) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');

    if (tx.ownerA_Id === user.id || tx.ownerA_Username === user.username) tx.returnedByA = true;
    if (tx.ownerB_Id === user.id || tx.ownerB_Username === user.username) tx.returnedByB = true;

    if (tx.returnedByA && tx.returnedByB) {
      tx.status = 'returned';
      tx.returnDate = new Date().toISOString().split('T')[0];

      // Set books back to available
      const books = storageService.getBooks();
      const bookA = books.find(b => b.id === tx.bookIdA);
      const bookB = books.find(b => b.id === tx.bookIdB);
      if (bookA) bookA.status = 'available';
      if (bookB) bookB.status = 'available';
      storageService.saveBooks(books);
    }

    storageService.saveTransactions(txs);
    return tx;
  },

  requestExtension(transactionId) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');

    tx.extendRequested = true;
    storageService.saveTransactions(txs);
    return tx;
  },

  approveExtension(transactionId) {
    const txs = storageService.getTransactions();
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) throw new Error('Không tìm thấy giao dịch.');

    const currDue = new Date(tx.dueDate);
    currDue.setDate(currDue.getDate() + 7); // +7 days
    tx.dueDate = currDue.toISOString().split('T')[0];
    tx.extended = true;
    tx.extendRequested = false;

    storageService.saveTransactions(txs);
    return tx;
  },

  toggleBookVisibility(bookId, user) {
    const books = storageService.getBooks();
    const book = books.find(b => b.id === bookId);
    if (!book) throw new Error('Không tìm thấy sách.');
    if (book.ownerId !== user.id && book.ownerUsername !== user.username) {
      throw new Error('Bạn không có quyền chỉnh sửa sách này.');
    }

    book.status = book.status === 'hidden' ? 'available' : 'hidden';
    storageService.saveBooks(books);
    return book;
  },

  addBook(newBookData, user) {
    const books = storageService.getBooks();

    // Hệ thống kiểm tra tự động chống gian lận/spam farm điểm
    const cleanTitle = (newBookData.title || '').trim().toLowerCase();
    const cleanAuthor = (newBookData.author || '').trim().toLowerCase();
    const cleanFileName = (newBookData.fileName || '').trim().toLowerCase();
    const cleanDataUrl = (newBookData.fileDataUrl || '').trim();

    const isDuplicate = books.some(b => {
      const sameTitleAndAuthor = (b.title || '').trim().toLowerCase() === cleanTitle && (b.author || '').trim().toLowerCase() === cleanAuthor;
      const sameFile = cleanFileName && b.fileName && b.fileName.toLowerCase() === cleanFileName && b.fileSize === newBookData.fileSize;
      const sameData = cleanDataUrl && b.fileDataUrl && b.fileDataUrl === cleanDataUrl;
      return sameTitleAndAuthor || sameFile || sameData;
    });

    if (isDuplicate) {
      throw new Error('Hệ thống phát hiện cuốn sách này đã tồn tại trên thư viện! Mỗi cuốn sách là riêng biệt, không được phép đăng trùng lặp để tích điểm.');
    }

    // Reward creator +15 points immediately per new requirement
    pointService.addPoints(user.id, 15, 'add_book', `Đăng sách mới lên thư viện: ${newBookData.title}`);

    const newBook = {
      id: 'book_' + Date.now(),
      title: newBookData.title,
      author: newBookData.author,
      category: newBookData.category || 'Văn học cổ điển',
      ownerId: user.id,
      ownerUsername: user.username,
      ownerName: user.displayName || user.username,
      type: newBookData.type || 'borrow',
      format: newBookData.format || 'PDF',
      language: newBookData.language || 'Tiếng Việt',
      publisher: newBookData.publisher || 'Tự xuất bản',
      publishYear: newBookData.publishYear || '2026',
      coverImage: newBookData.coverImage || '',
      coverBg: 'from-emerald-900 to-slate-900',
      status: 'available',
      description: newBookData.description || 'Không có mô tả.',
      pointsRule: newBookData.type === 'exchange' ? 'Đổi sách' : '−10đ để mượn',
      fileName: newBookData.fileName || 'tai_lieu.pdf',
      fileSize: newBookData.fileSize || '1.0 MB',
      fileDataUrl: newBookData.fileDataUrl || '',
      createdAt: new Date().toISOString().split('T')[0],
      readingContent: newBookData.readingContent || [
        {
          chapter: 'Mở đầu: ' + newBookData.title,
          content: newBookData.description || 'Nội dung sách đọc trực tuyến đang được đồng bộ.'
        }
      ]
    };

    books.unshift(newBook);
    storageService.saveBooks(books);
    return newBook;
  }
};
