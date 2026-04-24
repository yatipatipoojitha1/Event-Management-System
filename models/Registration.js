const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamSize: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
