const FilmRepository = require('../repositories/filmRepository');

class FilmController {
  constructor() {
    this.filmRepository = new FilmRepository();
  }

  getAll(req, res, next) {
    this.filmRepository.getAllWithGenreAndActors((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  getById(req, res, next) {
    const filmId = req.params.id;

    this.filmRepository.getByIdWithGenreAndActors(filmId, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result) {
        return res.status(404).json({ error: 'Film not found' });
      }

      res.status(200).json({
        message: 'success',
        data: result,
        id: req.params.id,
      });
    });
  }

  create(req, res, next) {
    const filmData = req.body;

    this.filmRepository.createWithGenreAndActors(filmData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result) {
        return res.status(400).json({ error: 'Invalid film data' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  update(req, res, next) {
    const filmId = req.params.id;
    const filmData = req.body;
    filmData.id = filmId;

    this.filmRepository.updateWithGenreAndActors(filmData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result) {
        return res.status(400).json({ error: 'Invalid film data' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  delete(req, res, next) {
    const filmId = req.params.id;
  
    this.filmRepository.delete(this.filmRepository.tableName, filmId, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (result.deletedID === 0) {
        return res.status(404).json({ error: 'Film not found' });
      }
      
      res.status(200).json({
        message: 'success',
        deletedID: result.deletedID,
      });
    });
  }
  
}

module.exports = FilmController;
