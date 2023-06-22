const express = require('express');
const ActorController = require('../controllers/actorController');

const actorRouter = express.Router();
const actorController = new ActorController();

actorRouter.get('/', (req, res, next) => {
    actorController.getAll(req, res, next);
});
  
actorRouter.post('/', (req, res, next) => {
    actorController.create(req, res, next);
});

actorRouter.get('/:id', (req, res, next) => {
    actorController.getById(req, res, next);
});

actorRouter.put('/:id', (req, res, next) => {
    actorController.update(req, res, next);
});

actorRouter.delete('/:id', (req, res, next) => {
    actorController.delete(req, res, next);
});


module.exports = actorRouter;
