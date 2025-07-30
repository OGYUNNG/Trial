const { Message } = require('./models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining their room
    socket.on('join', ({ userId }) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });

    // Handle chat messages
    socket.on('message', async (msg) => {
      try {
        const message = await Message.create({
          fromId: msg.from,
          toId: msg.to,
          content: msg.content,
          timestamp: msg.timestamp || new Date()
        });
        
        // Emit message to recipient
        io.to(msg.to).emit('message', message);
        console.log(`Message sent from ${msg.from} to ${msg.to}`);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle chat notifications (new chat sessions)
    socket.on('chatNotification', (notification) => {
      // Broadcast to admin room
      io.to('admin').emit('chatNotification', notification);
      console.log('Chat notification sent to admin:', notification);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 