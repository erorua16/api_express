const express = require('express');
const GenresController = require('../controllers/genreController');

const genreRouter = express.Router();
const genresController = new GenresController();


genreRouter.get('/', (req, res, next) => {
    genresController.getAll(req, res, next);
  });

genreRouter.post('/', (req, res, next) => {
    genresController.create(req, res, next);
});

genreRouter.delete('/:id', (req, res, next) => {
    genresController.delete(req, res, next);
});

module.exports = genreRouter;
