// API Service to communicate with Express + MySQL 8.0 Backend

const BASE_URL = '/api';

export const apiService = {
  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Books
  async getBooks() {
    try {
      const res = await fetch(`${BASE_URL}/books`);
      if (!res.ok) throw new Error('Failed to fetch books');
      return await res.json();
    } catch (err) {
      console.warn('API getBooks error, fallback:', err);
      return null;
    }
  },

  async createBook(book) {
    try {
      const res = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create book');
      }
      return await res.json();
    } catch (err) {
      console.warn('API createBook error:', err);
      return null;
    }
  },

  async updateBook(id, updates) {
    try {
      const res = await fetch(`${BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      console.warn('API updateBook error:', err);
      return null;
    }
  },

  // Pins
  async getPins() {
    try {
      const res = await fetch(`${BASE_URL}/pins`);
      if (!res.ok) throw new Error('Failed to fetch pins');
      return await res.json();
    } catch (err) {
      console.warn('API getPins error, fallback:', err);
      return null;
    }
  },

  async createPin(pin) {
    try {
      const res = await fetch(`${BASE_URL}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pin)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create pin');
      }
      return await res.json();
    } catch (err) {
      console.warn('API createPin error:', err);
      return null;
    }
  },

  async toggleLikePin(pinId, userId) {
    try {
      const res = await fetch(`${BASE_URL}/pins/${pinId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch (err) {
      console.warn('API toggleLikePin error:', err);
      return null;
    }
  },

  async recordDownload(pinId) {
    try {
      const res = await fetch(`${BASE_URL}/pins/${pinId}/download`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err) {
      console.warn('API recordDownload error:', err);
      return null;
    }
  },

  async recordView(pinId) {
    try {
      const res = await fetch(`${BASE_URL}/pins/${pinId}/view`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err) {
      console.warn('API recordView error:', err);
      return null;
    }
  },

  async getLikedPins(userId) {
    try {
      const res = await fetch(`${BASE_URL}/liked-pins/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getLikedPins error:', err);
      return null;
    }
  },

  // Users
  async getUsers() {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getUsers error:', err);
      return null;
    }
  },

  async login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed');
      }
      return await res.json();
    } catch (err) {
      console.warn('API login error:', err);
      throw err;
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Register failed');
      }
      return await res.json();
    } catch (err) {
      console.warn('API register error:', err);
      throw err;
    }
  },

  // Transactions
  async getTransactions() {
    try {
      const res = await fetch(`${BASE_URL}/transactions`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getTransactions error:', err);
      return null;
    }
  },

  async createTransaction(tx) {
    try {
      const res = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create transaction');
      }
      return await res.json();
    } catch (err) {
      console.warn('API createTransaction error:', err);
      return null;
    }
  },

  async returnTransaction(id) {
    try {
      const res = await fetch(`${BASE_URL}/transactions/${id}/return`, {
        method: 'PUT'
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API returnTransaction error:', err);
      return null;
    }
  },

  // Points & Notifications
  async getPointsHistory(userId) {
    try {
      const res = await fetch(`${BASE_URL}/points/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getPointsHistory error:', err);
      return null;
    }
  },

  async getNotifications(userId) {
    try {
      const res = await fetch(`${BASE_URL}/notifications/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getNotifications error:', err);
      return null;
    }
  },

  async markNotificationRead(id) {
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.warn('API markNotificationRead error:', err);
    }
  },

  async markAllNotificationsRead(userId) {
    try {
      await fetch(`${BASE_URL}/notifications/user/${userId}/read-all`, { method: 'PUT' });
    } catch (err) {
      console.warn('API markAllNotificationsRead error:', err);
    }
  },

  // Comments
  async getComments(targetType, targetId) {
    try {
      const res = await fetch(`${BASE_URL}/comments/${targetType}/${targetId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API getComments error:', err);
      return null;
    }
  },

  async addComment(comment) {
    try {
      const res = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API addComment error:', err);
      return null;
    }
  }
};
