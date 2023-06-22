const GenresRepository = require('../repositories/genreRepository');

class GenresController {
    constructor() {
      this.genresRepository = new GenresRepository();
    }

    getAll(req, res, next) {
      this.genresRepository.getAll(this.genresRepository.tableName, (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: result,
        });
      });
    }
  
    create(req, res, next) {
      const data = {
        name: req.body.name,
      };
      this.genresRepository.create(this.genresRepository.tableName, data, (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: result,
        });
      });
    }
  
    delete(req, res, next) {
      const id = req.params.id;
      this.genresRepository.delete(this.genresRepository.tableName, id, (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(200).json({
          message: 'success',
          deletedID: result.deletedID,
        });
      });
    }
  }

module.exports = GenresController;
