export const intercomClient = {
  sendReply: jest.fn().mockResolvedValue({ success: true }),
  getConversation: jest.fn().mockResolvedValue({ data: { conversation: {} } }),
  listConversations: jest.fn().mockResolvedValue({ data: { conversations: [] } }),
};

export default intercomClient; 