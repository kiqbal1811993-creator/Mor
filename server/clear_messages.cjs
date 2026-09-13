const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

const messageSchema = new mongoose.Schema({
  sessionId: String,
  sender: String,
  text: String,
  product: { title: String, price: Number, image: String },
  read: Boolean
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

async function clearMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');
    const result = await Message.deleteMany({});
    console.log(`Deleted ${result.deletedCount} chat/helpline messages.`);
    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

clearMessages();
