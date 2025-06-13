// messageService.js - Service để gọi API
export const messageService = {
  // Lấy message count của user hiện tại
  getUserMessageCount: async () => {
    try {
      const response = await fetch('/api/message-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Nếu dùng JWT
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch message count');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching message count:', error);
      throw error;
    }
  },

  // Reset message count về 0
  resetUserMessageCount: async () => {
    try {
      const response = await fetch('/api/message-count/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset message count');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting message count:', error);
      throw error;
    }
  }
};
