const FilmRepository = require("../repositories/filmRepository");

class FilmController {
  constructor() {
    this.filmRepository = new FilmRepository();
  }

  getAll(req, res, next) {
    try {
      this.filmRepository.getAllWithGenreAndActors((err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json({
          message: "success",
          data: result,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  getById(req, res, next) {
    try {
      const filmId = req.params.id;

      this.filmRepository.getByIdWithGenreAndActors(filmId, (err, result) => {
        if (err) {
          if (err.message.includes("Film with the specified ID does not exist") ) {
            return res.status(404).json({ error: "Film with the specified ID does not exist" });
          }
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.status(200).json({
          message: "success",
          data: result,
          id: req.params.id,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  create(req, res, next) {
    try {
      const filmData = req.body;
      const requiredFields = ["name", "synopsis", "genre_id", "actor_ids"];
      const missingFields = [];

      for (const field of requiredFields) {
        if (!filmData[field]) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(
          ", "
        )}`;
        return res.status(400).json({ error: errorMessage });
      }

      if(filmData.actor_ids.length == 0) {
        return res.status(400).json({ error: "There needs to be at least one actor id"})
      }
      this.filmRepository.createWithGenreAndActors(filmData, (err, result) => {
        if (err) {
          console.error(err);
          if (err.message.includes("Invalid columns")) {
            res.status(422).json({ error: err.message });
            return;
          }
          if (
            err.message.includes("Film with the specified ID does not exist.")
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: Film with the specified ID does not exist.",
            });
          }
          if (
            err.message.includes("Genre with the specified ID does not exist.")
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: Genre with the specified ID does not exist.",
            });
          }
          if (
            err.message.includes(
              "One or more actors with the specified IDs do not exist."
            )
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: One or more actors with the specified IDs do not exist.",
            });
          }
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!result) {
          return res.status(400).json({ error: "Invalid film data" });
        }
        res.status(201).json({
          message: "success",
          data: filmData,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  update(req, res, next) {
    try {
      const filmId = req.params.id;
      const filmData = req.body;
      filmData.id = filmId;

      if(filmData.actor_ids.length == 0) {
        return res.status(400).json({ error: "There needs to be at least one actor id"})
      }

      this.filmRepository.updateWithGenreAndActors(filmData, (err, result) => {
        if (err) {
          if (err.message.includes("Invalid columns")) {
            res.status(422).json({ error: err.message });
            return;
          }
          if (
            err.message.includes("Film with the specified ID does not exist.")
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: Film with the specified ID does not exist.",
            });
          }
          if (
            err.message.includes("Genre with the specified ID does not exist.")
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: Genre with the specified ID does not exist.",
            });
          }
          if (
            err.message.includes(
              "One or more actors with the specified IDs do not exist."
            )
          ) {
            return res.status(400).json({
              error:
                "Invalid film data: One or more actors with the specified IDs do not exist.",
            });
          }
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!result) {
          return res.status(400).json({ error: "Invalid film data" });
        }
        res.status(200).json({
          message: "success",
          data: filmData,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  delete(req, res, next) {
    try {
      const filmId = req.params.id;

      this.filmRepository.deleteFilm(
        this.filmRepository.tableName,
        filmId,
        (err, result) => {
          if (err) {
            if (err.message.includes("Film not found")) {
              return res
                .status(404)
                .json({ error: "film not found with specified id" });
            }
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.status(200).json({
            message: "success",
            deletedID: result.deletedID,
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = FilmController;
