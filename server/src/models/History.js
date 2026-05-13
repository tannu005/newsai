import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sources: [Object],
  analysis: Object,
  query: String
});

const History = mongoose.models.History || mongoose.model('History', historySchema);

export default History;
