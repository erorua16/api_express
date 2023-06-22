const db = require('../database');

class GenresController {
  getAll(req, res, next) {
    try {
      db.all('SELECT * FROM genres', (err, rows) => {
        if (err) {
          console.error('Error retrieving genres:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: rows,
        });
      });
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  create(req, res, next) {
    try {
      const name = req.body.name;
      if (!name) {
        res.status(400).json({ error: 'Genre name is required' });
        return;
      }
      const query = 'INSERT INTO genres (name) VALUES (?)';
      db.run(query, [name], function (err) {
        if (err) {
          console.error('Error creating genre:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(201).json({
          message: 'success',
          data: {
            id: this.lastID,
            name: name,
          },
        });
      });
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  delete(req, res, next) {
    try {
      const id = req.params.id;
      const filmsQuery = 'SELECT COUNT(*) AS count FROM films WHERE genre_id = ?';
      db.get(filmsQuery, [id], (err, row) => {
        if (err) {
          console.error('Error retrieving films count:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        if (row.count > 0) {
          res.status(403).json({ error: 'Genre is used in one or more films' });
          return;
        }
        const deleteQuery = 'DELETE FROM genres WHERE id = ?';
        db.run(deleteQuery, [id], function (err) {
          if (err) {
            console.error('Error deleting genre:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
          if (this.changes === 0) {
            console.error('Genre not found for deletion');
            res.status(404).json({ error: 'Genre not found' });
            return;
          }
          res.status(200).json({
            message: 'success',
            deletedID: id,
          });
        });
      });
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = GenresController;