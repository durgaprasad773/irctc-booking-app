import express from 'express';
import { run, get, all } from '../database.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name, number, source, destination, departure_time, arrival_time,
      duration, sleeper_fare, ac3_fare, ac2_fare,
      sleeper_available, ac3_available, ac2_available
    } = req.body;

    console.log('Received train data:', req.body);

    const result = await run(
      `INSERT INTO trains (name, number, source, destination, departure_time, arrival_time,
       duration, sleeper_fare, ac3_fare, ac2_fare, sleeper_available, ac3_available, ac2_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, number, source, destination, departure_time, arrival_time,
       duration, sleeper_fare, ac3_fare, ac2_fare,
       sleeper_available, ac3_available, ac2_available]
    );

    res.status(201).json({ message: 'Train added successfully', trainId: result.lastID });
  } catch (error) {
    console.error('Error adding train:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { source, destination } = req.query;

    const trains = await all(
      `SELECT * FROM trains WHERE 
       LOWER(source) LIKE LOWER(?) AND 
       LOWER(destination) LIKE LOWER(?)`,
      [`%${source}%`, `%${destination}%`]
    );

    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/all', authenticate, async (req, res) => {
  try {
    const trains = await all('SELECT * FROM trains ORDER BY created_at DESC');
    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const train = await get('SELECT * FROM trains WHERE id = ?', [req.params.id]);
    
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }
    
    res.json(train);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/update/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name, number, source, destination, departure_time, arrival_time,
      duration, sleeper_fare, ac3_fare, ac2_fare,
      sleeper_available, ac3_available, ac2_available
    } = req.body;

    await run(
      `UPDATE trains SET name = ?, number = ?, source = ?, destination = ?, 
       departure_time = ?, arrival_time = ?, duration = ?, sleeper_fare = ?, 
       ac3_fare = ?, ac2_fare = ?, sleeper_available = ?, ac3_available = ?, ac2_available = ?
       WHERE id = ?`,
      [name, number, source, destination, departure_time, arrival_time,
       duration, sleeper_fare, ac3_fare, ac2_fare,
       sleeper_available, ac3_available, ac2_available, req.params.id]
    );

    res.json({ message: 'Train updated successfully' });
  } catch (error) {
    console.error('Error updating train:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/delete/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await run('DELETE FROM trains WHERE id = ?', [req.params.id]);
    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
