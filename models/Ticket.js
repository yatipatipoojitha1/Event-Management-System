const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participantName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  qrCode: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
