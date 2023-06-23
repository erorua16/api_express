const express = require("express");
const FilmActorsController = require("../controllers/filmActorsController");

const filmActorRouter = express.Router();
const filmActorsController = new FilmActorsController();

filmActorRouter.get("/", (req, res, next) => {
  filmActorsController.getAll(req, res, next);
});

filmActorRouter.post("/", (req, res, next) => {
  filmActorsController.create(req, res, next);
});

filmActorRouter.delete("/:id", (req, res, next) => {
  filmActorsController.delete(req, res, next);
});

module.exports = filmActorRouter;
