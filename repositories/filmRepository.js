const BaseRepository = require("./baseRepository");
const db = require("../database");

class FilmRepository extends BaseRepository {
  constructor() {
    super();
    this.tableName = "films";
  }

  getAllWithGenreAndActors(callback) {
    const sql = `
      SELECT f.*, g.id AS genre_id, g.name AS genre_name, GROUP_CONCAT(a.id) AS actor_ids, GROUP_CONCAT(a.first_name) AS actor_first_names, GROUP_CONCAT(a.last_name) AS actor_last_names, GROUP_CONCAT(a.date_of_birth) AS actor_dates_of_birth, GROUP_CONCAT(a.date_of_death) AS actor_dates_of_death
      FROM films AS f
      LEFT JOIN genres AS g ON f.genre_id = g.id
      LEFT JOIN films_actors AS fa ON f.id = fa.film_id
      LEFT JOIN actors AS a ON fa.actor_id = a.id
      GROUP BY f.id
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err);
        return;
      }

      const films = rows.map((row) => ({
        id: row.id,
        name: row.name,
        synopsis: row.synopsis,
        release_year: row.release_year ? row.release_year : null,
        genre: {
          id: row.genre_id,
          name: row.genre_name,
        },
        actors: row.actor_ids
          ? row.actor_ids.split(",").map((id, index) => ({
              id: id,
              first_name: row.actor_first_names.split(",")[index],
              last_name: row.actor_last_names.split(",")[index],
              date_of_birth: row.actor_dates_of_birth.split(",")[index],
              date_of_death: row.actor_dates_of_death
                ? row.actor_dates_of_death.split(",")[index]
                : null,
            }))
          : [],
      }));

      callback(null, films);
    });
  }

  getByIdWithGenreAndActors(id, callback) {
    const sql = `
      SELECT f.*, g.id AS genre_id, g.name AS genre_name, GROUP_CONCAT(a.id) AS actor_ids, GROUP_CONCAT(a.first_name) AS actor_first_names, GROUP_CONCAT(a.last_name) AS actor_last_names, GROUP_CONCAT(a.date_of_birth) AS actor_dates_of_birth, GROUP_CONCAT(a.date_of_death) AS actor_dates_of_death
      FROM films AS f
      LEFT JOIN genres AS g ON f.genre_id = g.id
      LEFT JOIN films_actors AS fa ON f.id = fa.film_id
      LEFT JOIN actors AS a ON fa.actor_id = a.id
      WHERE f.id = ?
      GROUP BY f.id
    `;
    const params = [id];
  
    db.get(sql, params, (err, row) => {
      if (err) {
        callback(err);
        return;
      }
      if (!row) {
        callback(new Error("Film with the specified ID does not exist."));
        return;
      }
  
      const film = {
        id: row.id,
        name: row.name,
        synopsis: row.synopsis,
        release_year: row.release_year ? row.release_year : null,
        genre: {
          id: row.genre_id,
          name: row.genre_name,
        },
        actors: row.actor_ids
          ? row.actor_ids.split(",").map((id, index) => ({
              id: id,
              first_name: row.actor_first_names.split(",")[index],
              last_name: row.actor_last_names.split(",")[index],
              date_of_birth: row.actor_dates_of_birth.split(",")[index],
              date_of_death: row.actor_dates_of_death
                ? row.actor_dates_of_death.split(",")[index]
                : null,
            }))
          : [],
      };
  
      if (film.actors.length === 1) {
        film.actors = film.actors[0]; // Set the single actor object directly instead of wrapping it in an array
      }
  
      callback(null, film);
    });
  }
  

  createWithGenreAndActors(filmData, callback) {
    const columnNames = Object.keys(filmData).join(", ") ;
    const sql = `PRAGMA table_info(${this.tableName})`;
    db.all(sql, [], (err, columns) => {
      if (err) {
        callback(err);
        return;
      }
  
      const allowedColumns = columns.map((column) => column.name.toLowerCase());
      allowedColumns.push("actor_ids")
  
      const invalidColumns = columnNames
        .split(", ")
        .filter((key) => !allowedColumns.includes(key.toLowerCase()));
  
      if (invalidColumns.length > 0) {
        const error = new Error(`Invalid columns: ${invalidColumns.join(", ")}`);
        callback(error);
        return;
      }
  
      const genreId = filmData.genre_id;
      const actorIds = filmData.actor_ids;
  
      // Check if genre exists
      db.get("SELECT id FROM genres WHERE id = ?", [genreId], (err, genreRow) => {
        if (err) {
          callback(err);
          return;
        }
        if (!genreRow) {
          callback(new Error("Genre with the specified ID does not exist."), null);
          return;
        }
  
        // Check if all actors exist
        const placeholders = actorIds.map(() => "?").join(", ");
        const sql = `SELECT id FROM actors WHERE id IN (${placeholders})`;
        db.all(sql, actorIds, (err, actorRows) => {
          if (err) {
            callback(err);
            return;
          }
          if (actorIds.length !== actorRows.length) {
            callback(
              new Error("One or more actors with the specified IDs do not exist."),
              null
            );
            return;
          }
  
          // Create film
          const film = {
            name: filmData.name,
            synopsis: filmData.synopsis,
            release_year: filmData.release_year,
            genre_id: genreId,
          };
          this.create(this.tableName, film, (err, result) => {
            if (err) {
              callback(err);
              return;
            }
            const filmId = result.id;
            const associations = actorIds.map((actorId) => ({
              film_id: filmId,
              actor_id: actorId,
            }));
  
            const placeholders = associations.map(() => "(?, ?)").join(", ");
            const values = associations.reduce(
              (acc, curr) => [...acc, curr.film_id, curr.actor_id],
              []
            );
            db.run(
              `INSERT INTO films_actors (film_id, actor_id) VALUES ${placeholders}`,
              values,
              (err) => {
                if (err) {
                  callback(err);
                  return;
                }
                callback(null, result);
              }
            );
          });
        });
      });
    });
  }
  
  

  updateWithGenreAndActors(filmData, callback) {
    const filmId = filmData.id;
    const genreId = filmData.genre_id;
    const actorIds = filmData.actor_ids;

    // Check if film exists
    this.getById(this.tableName, filmId, (err, filmRow) => {
      if (err) {
        callback(err);
        return;
      }
      if (!filmRow) {
        callback(new Error("Film with the specified ID does not exist."), null);
        return;
      }

      // Update film fields
      const updateFields = [];
      const updateParams = [];

      if (filmData.name) {
        updateFields.push("name = ?");
        updateParams.push(filmData.name);
      }
      if (filmData.synopsis) {
        updateFields.push("synopsis = ?");
        updateParams.push(filmData.synopsis);
      }
      if (filmData.release_year) {
        updateFields.push("release_year = ?");
        updateParams.push(filmData.release_year);
      }
      if (genreId) {
        // Check if genre exists
        this.getById("genres", genreId, (err, genreRow) => {
          if (err) {
            callback(err);
            return;
          }
          if (!genreRow) {
            callback(
              new Error("Genre with the specified ID does not exist."),
              null
            );
            return;
          }
          updateFields.push("genre_id = ?");
          updateParams.push(genreId);

          updateFilm();
        });
      }

      const updateFilm = () => {
        if (updateFields.length === 0) {
          // No film fields to update
          updateActors();
          return;
        }

        // Update film
        const updateQuery = `UPDATE films SET ${updateFields.join(
          ", "
        )} WHERE id = ?`;
        const updateParamsWithFilmId = [...updateParams, filmId];
        const schema = `PRAGMA table_info(${this.tableName})`;
        db.all(schema, [], (err, columns) => {
          if (err) {
            callback(err);
            return;
          }
          const columnNames = Object.keys(filmData).filter(
            (key) => key !== "id"
          );
          const allowedColumns = columns.map((column) =>
            column.name.toLowerCase()
          );
          allowedColumns.push("actor_ids")
          const invalidColumns = columnNames.filter(
            (key) => !allowedColumns.includes(key.toLowerCase())
          );
          if (invalidColumns.length > 0) {
            const error = new Error(
              `Invalid columns: ${invalidColumns.join(", ")}`
            );
            callback(error);
            return;
          }
          db.run(updateQuery, updateParamsWithFilmId, (err, result) => {
            if (err) {
              callback(err);
              return;
            }
            updateActors();
          });
        });
      };

      const updateActors = () => {
        if (!actorIds || actorIds.length === 0) {
          callback(null, filmRow);
          return;
        }

        const placeholders = actorIds.map(() => "?").join(", ");
        const sql = `SELECT id FROM actors WHERE id IN (${placeholders})`;
        db.all(sql, actorIds, (err, actorRows) => {
          if (err) {
            callback(err);
            return;
          }
          if (actorIds.length !== actorRows.length) {
            callback(
              new Error(
                "One or more actors with the specified IDs do not exist."
              ),
              null
            );
            return;
          }

          db.run(
            "DELETE FROM films_actors WHERE film_id = ?",
            [filmId],
            (err) => {
              if (err) {
                callback(err);
                return;
              }
              const associations = actorIds.map((actorId) => ({
                film_id: filmId,
                actor_id: actorId,
              }));

              const placeholders = associations.map(() => "(?, ?)").join(", ");
              const values = associations.reduce(
                (acc, curr) => [...acc, curr.film_id, curr.actor_id],
                []
              );
              db.run(
                `INSERT INTO films_actors (film_id, actor_id) VALUES ${placeholders}`,
                values,
                (err) => {
                  if (err) {
                    callback(err);
                    return;
                  }
                  callback(null, filmRow);
                }
              );
            }
          );
        });
      };

      if (!genreId) {
        updateFilm();
      }
    });
  }

  deleteFilm(tableName, id, callback) {
    const params = [id];

    this.getById(tableName, id, (err, result) => {
      if (err) {
        callback(err);
        return;
      }

      if (!result) {
        const error = new Error('Film not found')
        callback(error);
        return;
      }

      db.run(`DELETE FROM ${tableName} WHERE id = ?`, params, (err) => {
        if (err) {
          callback(err);
          return;
        }

        const deletedID = this.changes;

        db.run(`DELETE FROM films_actors WHERE film_id = ?`, params, (err) => {
          if (err) {
            callback(err);
            return;
          }

          callback(null, {
            deletedID: deletedID,
          });
        });
      });
    });
  }
}

module.exports = FilmRepository;
