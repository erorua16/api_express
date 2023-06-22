const BaseRepository = require('./baseRepository');
const db = require('../database');

class FilmRepository extends BaseRepository {
  constructor() {
    super();
    this.tableName = 'films';
  }

  getAllWithGenreAndActors(callback) {
    const sql = `
      SELECT f.*, g.id AS genre_id, g.name AS genre_name, GROUP_CONCAT(a.id) AS actor_ids, a.first_name AS actor_first_name, a.last_name AS actor_last_name, a.date_of_birth AS actor_date_of_birth, a.date_of_death AS actor_date_of_death
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
  
      const films = rows.map(row => ({
        id: row.id,
        name: row.name,
        synopsis: row.synopsis,
        release_year: row.release_year,
        genre: {
          id: row.genre_id,
          name: row.genre_name
        },
        actors: row.actor_ids ? row.actor_ids.split(',').map((id, index) => ({
          id: id,
          first_name: row.actor_first_name.split(',')[index],
          last_name: row.actor_last_name.split(',')[index],
          date_of_birth: row.actor_date_of_birth.split(',')[index],
          date_of_death: row.actor_date_of_death.split(',')[index]
        })) : []
      }));
  
      callback(null, films);
    });
  }
  
  getByIdWithGenreAndActors(id, callback) {
    const sql = `
      SELECT f.*, g.id AS genre_id, g.name AS genre_name, GROUP_CONCAT(a.id) AS actor_ids, a.first_name AS actor_first_name, a.last_name AS actor_last_name, a.date_of_birth AS actor_date_of_birth, a.date_of_death AS actor_date_of_death
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
        callback(null, null);
        return;
      }
  
      const film = {
        id: row.id,
        name: row.name,
        synopsis: row.synopsis,
        release_year: row.release_year,
        genre: {
          id: row.genre_id,
          name: row.genre_name
        },
        actors: row.actor_ids ? row.actor_ids.split(',').map((id, index) => ({
          id: id,
          first_name: row.actor_first_name.split(',')[index],
          last_name: row.actor_last_name.split(',')[index],
          date_of_birth: row.actor_date_of_birth.split(',')[index],
          date_of_death: row.actor_date_of_death.split(',')[index]
        })) : []
      };
  
      callback(null, film);
    });
  }
  
  createWithGenreAndActors(filmData, callback) {
    console.log('hi')
    const genreId = filmData.genre_id;
    const actorIds = filmData.actor_ids;
  
    // Check if genre exists
    db.get('SELECT id FROM genres WHERE id = ?', [genreId], (err, genreRow) => {
        console.log('hi2')
      if (err) {
        callback(err);
        return;
      }
      if (!genreRow) {
        callback(null, null);
        return;
      }
  
    // Check if all actors exist
    const placeholders = actorIds.map(() => '?').join(', ');
    const sql = `SELECT id FROM actors WHERE id IN (${placeholders})`;
    db.all(sql, actorIds, (err, actorRows) => {
    console.log('hi3')
    console.log('actorIds:', actorIds);
    console.log('actorRows:', actorRows);
    if (err) {
        console.log('errrrrrrr')
        callback(err);
        return;
    }
    if (actorIds.length !== actorRows.length) {
        console.log('error')
        callback(null, null);
        return;
    }
    console.log('hi4')
    // Create film
    const film = {
        name: filmData.name,
        synopsis: filmData.synopsis,
        release_year: filmData.release_year,
        genre_id: genreId
    };

    console.log('hi5')
    this.create(this.tableName, film, (err, result) => {
        if (err) {
            callback(err);
        return;
        }

        // Create film-actor associations
        const filmId = result.id;
        const associations = actorIds.map(actorId => ({
            film_id: filmId,
            actor_id: actorId
        }));

        const placeholders = associations.map(() => '(?, ?)').join(', ');
        const values = associations.reduce((acc, curr) => [...acc, curr.film_id, curr.actor_id], []);
        db.run(`INSERT INTO films_actors (film_id, actor_id) VALUES ${placeholders}`, values, function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, result);
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
    db.get('SELECT id FROM films WHERE id = ?', [filmId], (err, filmRow) => {
      if (err) {
        callback(err);
        return;
      }
      if (!filmRow) {
        callback(null, null);
        return;
      }

      // Check if genre exists
      db.get('SELECT id FROM genres WHERE id = ?', [genreId], (err, genreRow) => {
        if (err) {
          callback(err);
          return;
        }
        if (!genreRow) {
          callback(null, null);
          return;
        }

        // Check if all actors exist
        const sql = 'SELECT id FROM actors WHERE id IN (?)';
        db.all(sql, [actorIds], (err, actorRows) => {
          if (err) {
            callback(err);
            return;
          }
          if (actorIds.length !== actorRows.length) {
            callback(null, null);
            return;
          }

          // Update film
          const film = {
            id: filmId,
            name: filmData.name,
            synopsis: filmData.synopsis,
            release_year: filmData.release_year,
            genre_id: genreId
          };

          this.update(this.tableName, film, (err, result) => {
            if (err) {
              callback(err);
              return;
            }

            // Delete existing film-actor associations
            db.run('DELETE FROM films_actors WHERE film_id = ?', [filmId], (err) => {
              if (err) {
                callback(err);
                return;
              }

              // Create new film-actor associations
              const associations = actorIds.map(actorId => ({
                film_id: filmId,
                actor_id: actorId
              }));

              db.run('INSERT INTO films_actors (film_id, actor_id) VALUES (?, ?)', associations, function (err) {
                if (err) {
                  callback(err);
                  return;
                }
                callback(null, result);
              });
            });
          });
        });
      });
    });
  }
}

module.exports = FilmRepository;
