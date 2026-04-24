const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getAllEventsAdmin, updateEventStatus } = require('../controllers/eventController');
const { protect, admin, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getEvents).post(protect, admin, createEvent);
router.get('/admin/all', protect, isAdmin, getAllEventsAdmin);
router.put('/:id/status', protect, isAdmin, updateEventStatus);
router.route('/:id').get(getEventById).put(protect, admin, updateEvent).delete(protect, admin, deleteEvent);

module.exports = router;
