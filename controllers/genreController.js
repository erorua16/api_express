const GenresRepository = require('../repositories/genreRepository');

class GenresController {
  constructor() {
    this.genresRepository = new GenresRepository();
  }

  getAll(req, res, next) {
    try {
      this.genresRepository.getAll('genres', (err, rows) => {
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
      const data = { name };
      this.genresRepository.create('genres', data, (err, result) => {
        if (err) {
          console.error('Error creating genre:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(201).json({
          message: 'success',
          data: data,
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
        this.genresRepository.delete('genres', id, (err, result) => {
          if (err) {
            console.error('Error deleting genre:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
          if (result.deletedID === 0) {
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
