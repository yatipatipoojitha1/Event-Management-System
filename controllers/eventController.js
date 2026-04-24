const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    query.status = 'approved';

    const events = await Event.find(query).populate('organizer', 'name email').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, coverImage, maxParticipants, ticketPrice, maxTeamSize } = req.body;

    const event = new Event({
      title,
      description,
      category,
      date,
      time,
      coverImage,
      maxParticipants,
      ticketPrice,
      maxTeamSize,
      organizer: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, coverImage, maxParticipants, ticketPrice, maxTeamSize } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to edit this event' });
      }

      event.title = title || event.title;
      event.description = description || event.description;
      event.category = category || event.category;
      event.date = date || event.date;
      event.time = time || event.time;
      event.coverImage = coverImage || event.coverImage;
      event.maxParticipants = maxParticipants || event.maxParticipants;
      if (ticketPrice !== undefined) event.ticketPrice = ticketPrice;
      if (maxTeamSize !== undefined) event.maxTeamSize = maxTeamSize;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this event' });
      }
      await event.deleteOne();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name email').sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      event.status = status;
      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getAllEventsAdmin, updateEventStatus };
