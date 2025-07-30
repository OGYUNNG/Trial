const { Message, User } = require('../models');

exports.getMessages = async (req, res) => {
  try {
    const { fromId, toId } = req.query;
    
    if (req.user.role === 'admin') {
      // Admin can fetch any messages
      const messages = await Message.findAll({
        where: {
          [req.user.id === parseInt(fromId) ? 'fromId' : 'toId']: req.user.id
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name'] },
          { model: User, as: 'receiver', attributes: ['id', 'name'] }
        ],
        order: [['timestamp', 'ASC']]
      });
      res.json(messages);
    } else {
      // Users can only fetch their own messages
      const messages = await Message.findAll({
        where: {
          [req.user.id === parseInt(fromId) ? 'fromId' : 'toId']: req.user.id
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name'] },
          { model: User, as: 'receiver', attributes: ['id', 'name'] }
        ],
        order: [['timestamp', 'ASC']]
      });
      res.json(messages);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 