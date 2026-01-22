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

    // Validate required fields
    if (!train_id || !journey_date || !bookingClass || !passengers || !total_fare || !payment_method) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate passengers array
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: 'At least one passenger is required' });
    }

    // Get train details and check seat availability
    const train = await get('SELECT * FROM trains WHERE id = ?', [train_id]);
    
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const passengerCount = passengers.length;
    let availableSeats = 0;
    let seatField = '';

    // Determine available seats based on class
    switch(bookingClass) {
      case 'Sleeper':
        availableSeats = train.sleeper_available;
        seatField = 'sleeper_available';
        break;
      case 'AC 3-Tier':
        availableSeats = train.ac3_available;
        seatField = 'ac3_available';
        break;
      case 'AC 2-Tier':
        availableSeats = train.ac2_available;
        seatField = 'ac2_available';
        break;
      default:
        return res.status(400).json({ message: 'Invalid class selected' });
    }

    // Validate seat availability
    if (availableSeats <= 0) {
      return res.status(400).json({ 
        message: `No seats available in ${bookingClass}`,
        availableSeats: 0
      });
    }

    if (passengerCount > availableSeats) {
      return res.status(400).json({ 
        message: `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available in ${bookingClass}. You are trying to book ${passengerCount} seat${passengerCount !== 1 ? 's' : ''}.`,
        availableSeats: availableSeats,
        requestedSeats: passengerCount
      });
    }

    const pnr = generatePNR();

    // Create booking
    const result = await run(
      `INSERT INTO bookings (user_id, train_id, pnr, journey_date, class, passengers, total_fare, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, train_id, pnr, journey_date, bookingClass, JSON.stringify(passengers), total_fare, payment_method]
    );

    // Update available seats
    await run(
      `UPDATE trains SET ${seatField} = ${seatField} - ? WHERE id = ?`,
      [passengerCount, train_id]
    );

    // Get updated train details to verify the update
    const updatedTrain = await get('SELECT * FROM trains WHERE id = ?', [train_id]);
    const updatedSeats = updatedTrain[seatField];

    console.log('Booking created successfully:', { 
      booking_id: result.lastID, 
      pnr,
      seatsBooked: passengerCount,
      remainingSeats: updatedSeats
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id: result.lastID,
      pnr: pnr,
      seatsBooked: passengerCount,
      remainingSeats: updatedSeats
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

    // Restore seats
    const passengers = JSON.parse(booking.passengers);
    const passengerCount = passengers.length;
    let seatField = '';

    switch(booking.class) {
      case 'Sleeper':
        seatField = 'sleeper_available';
        break;
      case 'AC 3-Tier':
        seatField = 'ac3_available';
        break;
      case 'AC 2-Tier':
        seatField = 'ac2_available';
        break;
    }

    await run('UPDATE bookings SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
    
    if (seatField) {
      await run(
        `UPDATE trains SET ${seatField} = ${seatField} + ? WHERE id = ?`,
        [passengerCount, booking.train_id]
      );
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
