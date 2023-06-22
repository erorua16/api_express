const FilmActorsRepostiory = require('../repositories/filmActorsRepository');

class GenresController {
    constructor() {
      this.filmActorsRepostiory = new FilmActorsRepostiory();
    }

    getAll(req, res, next) {
      this.filmActorsRepostiory.getAll(this.filmActorsRepostiory.tableName, (err, result) => {
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
      this.filmActorsRepostiory.create(this.filmActorsRepostiory.tableName, data, (err, result) => {
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
      this.filmActorsRepostiory.delete(this.filmActorsRepostiory.tableName, id, (err, result) => {
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
