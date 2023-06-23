const BaseRepository = require("./baseRepository");
const db = require("../database");
class ActorRepository extends BaseRepository {
  constructor() {
    super();
    this.tableName = "actors";
  }

  delete(tableName, id, callback) {
    const params = [id];

    // Check if actor exists before deleting
    this.getById(tableName, id, (err, result) => {
      if (err) {
        callback(err);
        return;
      }

      if (!result) {
        const error = new Error('Actor not found')
        callback(error);
        return;
      }

      // Delete the actor from the actors table
      db.run(`DELETE FROM ${tableName} WHERE id = ?`, params, (err) => {
        if (err) {
          callback(err);
          return;
        }

        const deletedID = this.changes;

        // Delete the corresponding records from films_actors table
        db.run(`DELETE FROM films_actors WHERE actor_id = ?`, params, (err) => {
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

module.exports = ActorRepository;
