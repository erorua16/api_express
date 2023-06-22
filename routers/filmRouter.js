const express = require('express');
const FilmController = require('../controllers/filmController');

const filmRouter = express.Router();
const filmController = new FilmController();

filmRouter.get('/', (req, res, next) => {
    filmController.getAll(req, res, next);
  });
  
  filmRouter.post('/', (req, res, next) => {
    filmController.create(req, res, next);
  });
  
  filmRouter.get('/:id', (req, res, next) => {
    filmController.getById(req, res, next);
  });
  
  filmRouter.put('/:id', (req, res, next) => {
    filmController.update(req, res, next);
  });
  
  filmRouter.delete('/:id', (req, res, next) => {
    filmController.delete(req, res, next);
  });
  

module.exports = filmRouter;
