const express = require('express');
const router = express.Router();
const { registerForEvent, getUserRegistrations, cancelRegistration, getRegistrationTickets } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:eventId', protect, registerForEvent);
router.get('/my-registrations', protect, getUserRegistrations);
router.get('/:id/tickets', protect, getRegistrationTickets);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
