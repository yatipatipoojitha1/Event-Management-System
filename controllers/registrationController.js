const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');

const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { teamSize, participants } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate request body
    const size = teamSize ? parseInt(teamSize) : 1;
    if (size > event.maxTeamSize) {
      return res.status(400).json({ message: `Maximum team size is ${event.maxTeamSize}` });
    }

    if (!participants || participants.length !== size) {
      return res.status(400).json({ message: `Please provide details for ${size} participants` });
    }

    // Check max participants (total event capacity)
    if (event.registeredCount + size > event.maxParticipants) {
      return res.status(400).json({ message: `Only ${event.maxParticipants - event.registeredCount} spots left` });
    }

    // Calculate total amount
    const totalAmount = size * (event.ticketPrice || 0);

    // Create registration
    const registration = await Registration.create({
      event: eventId,
      user: req.user._id,
      teamSize: size,
      totalAmount: totalAmount,
      paymentStatus: 'completed' // In real app, integrate payment gateway
    });

    // Generate tickets
    const createdTickets = [];
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      // We will generate a QR code string mapping to this ticket/event info
      // A dummy ObjectId is generated to embed in the QR before actually creating the document
      const ticketId = new require('mongoose').Types.ObjectId();
      
      const qrData = JSON.stringify({
        ticketId: ticketId,
        eventId: eventId,
        name: participant.name
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);

      const ticket = await Ticket.create({
        _id: ticketId,
        registration: registration._id,
        event: eventId,
        participantName: participant.name,
        email: participant.email,
        phone: participant.phone,
        qrCode: qrCodeDataUrl
      });
      
      createdTickets.push(ticket);
    }

    // Update event count
    event.registeredCount += size;
    await event.save();

    res.status(201).json({
      registration,
      tickets: createdTickets
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationTickets = async (req, res) => {
  try {
    const registrationId = req.params.id;
    
    // Ensure the registration belongs to the user
    const registration = await Registration.findOne({ _id: registrationId, user: req.user._id });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found or unauthorized' });
    }

    const tickets = await Ticket.find({ registration: registrationId }).populate('event');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find and delete the tickets
    await Ticket.deleteMany({ registration: registration._id });

    // Decrement event count
    const event = registration.event;
    event.registeredCount = Math.max(0, event.registeredCount - registration.teamSize);
    await event.save();

    await registration.deleteOne();

    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerForEvent, getUserRegistrations, cancelRegistration, getRegistrationTickets };
