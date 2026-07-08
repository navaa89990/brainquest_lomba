// API Service untuk backend BrainQuest
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiService = {
  // Auth endpoints
  async signup(username: string, email: string, password: string, fullName: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async verifyToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async logout() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getAllUsers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // User endpoints
  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async updateProfile(token: string, fullName: string, profilePicture?: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, profilePicture }),
    });
    return response.json();
  },

  async getLeaderboard(limit = 10, offset = 0) {
    const response = await fetch(
      `${API_BASE_URL}/api/users/leaderboard?limit=${limit}&offset=${offset}`
    );
    return response.json();
  },

  async getUserRank(userId: number) {
    const response = await fetch(`${API_BASE_URL}/api/users/rank/${userId}`);
    return response.json();
  },

  async getUserSettings(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async updateUserSettings(token: string, settings: { theme?: string; notifications?: boolean; language?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  async updateUserRole(token: string, userId: number, role: 'user' | 'admin') {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  // Materials endpoints
  async getMaterials(page = 1, limit = 10, category?: string) {
    let url = `${API_BASE_URL}/api/materials?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    const response = await fetch(url);
    return response.json();
  },

  async getMaterialDetail(materialId: number) {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`);
    return response.json();
  },

  async verifyAnswers(materialId: number, answers: { questionId: number; answer: string }[]) {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/api/materials/categories`);
    return response.json();
  },

  // Quiz endpoints
  async submitQuiz(token: string, materialId: number, score: number, totalQuestions: number, timeSpent: number) {
    const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ materialId, score, totalQuestions, timeSpent }),
    });
    return response.json();
  },

  async getQuizHistory(token: string, limit = 20, offset = 0) {
    const response = await fetch(
      `${API_BASE_URL}/api/quiz/history?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  },

  async getQuizStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/quiz/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getArenaProgress(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/quiz/arena`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async updateArenaProgress(token: string, lessonId: string, levelId: number, completed: boolean) {
    const response = await fetch(`${API_BASE_URL}/api/quiz/arena/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lessonId, levelId, completed }),
    });
    return response.json();
  },

  async createMaterial(token: string, materialData: any) {
    const response = await fetch(`${API_BASE_URL}/api/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(materialData),
    });
    return response.json();
  },

  async updateMaterial(token: string, materialId: number, materialData: any) {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(materialData),
    });
    return response.json();
  },

  async deleteMaterial(token: string, materialId: number) {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async updateQuestion(token: string, questionId: number, questionData: any) {
    const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });
    return response.json();
  },
};


