import express from 'express';
import { run, get, all } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generatePNR = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

router.post('/create', authenticate, async (req, res) => {
  try {
    const { train_id, journey_date, class: bookingClass, passengers, total_fare, payment_method } = req.body;
    
    console.log('Booking request received:', {
      user_id: req.user.id,
      train_id,
      journey_date,
      class: bookingClass,
      passengers,
      total_fare,
      payment_method
    });

    const pnr = generatePNR();

    const result = await run(
      `INSERT INTO bookings (user_id, train_id, pnr, journey_date, class, passengers, total_fare, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, train_id, pnr, journey_date, bookingClass, JSON.stringify(passengers), total_fare, payment_method]
    );

    console.log('Booking created successfully:', { booking_id: result.lastID, pnr });

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id: result.lastID,
      pnr: pnr
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/user', authenticate, async (req, res) => {
  try {
    const bookings = await all(
      `SELECT b.*, t.name as train_name, t.number as train_number, 
       t.source, t.destination, t.departure_time, t.arrival_time
       FROM bookings b
       JOIN trains t ON b.train_id = t.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      passengers: JSON.parse(booking.passengers),
      train: {
        name: booking.train_name,
        number: booking.train_number,
        source: booking.source,
        destination: booking.destination,
        departure_time: booking.departure_time,
        arrival_time: booking.arrival_time
      }
    }));

    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/cancel/:id', authenticate, async (req, res) => {
  try {
    const booking = await get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    await run('UPDATE bookings SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
