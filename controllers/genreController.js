const GenresRepository = require('../repositories/genreRepository');

class GenresController {
    constructor() {
      this.genresRepository = new GenresRepository();
    }
  
    getById(req, res, next) {
      const id = req.params.id;
      this.genresRepository.getById(this.genresRepository.tableName, id, (err, row) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: row,
          id: req.params.id,
        });
      });
    }
  
    getAll(req, res, next) {
      this.genresRepository.getAll(this.genresRepository.tableName, (err, rows) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: rows,
        });
      });
    }
  
    create(req, res, next) {
      const data = {
        name: req.body.name,
      };
      this.genresRepository.create(this.genresRepository.tableName, data, (err, result) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(200).json({
          message: 'success',
          data: result,
        });
      });
    }
  
    update(req, res, next) {
      const reqBody = req.body;
      this.genresRepository.update(this.genresRepository.tableName, reqBody, (err, result) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(200).json({
          message: 'success',
          newData: result,
        });
      });
    }
  
    delete(req, res, next) {
      const id = req.params.id;
      this.genresRepository.delete(this.genresRepository.tableName, id, (err, result) => {
        if (err) {
          res.status(400).json({ error: err.message });
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
