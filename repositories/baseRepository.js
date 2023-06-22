const db = require('../database');

class BaseRepository {
    getById(tableName, id, callback) {
      const params = [id];
      db.get(`SELECT * FROM ${tableName} WHERE id = ?`, params, (err, row) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, row);
      });
    }
  
    getAll(tableName, callback) {
      db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, rows);
      });
    }
  
    create(tableName, data, callback) {
      const sql = `INSERT INTO ${tableName} (name) VALUES (?)`;
      const params = [data.name];
      db.run(sql, params, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, {
          id: this.lastID,
        });
      });
    }
  
    update(tableName, data, callback) {
      const sql = `UPDATE ${tableName} SET name = ? WHERE id = ?`;
      const params = [data.name, data.id];
      db.run(sql, params, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, {
          updatedID: this.changes,
        });
      });
    }
  
    delete(tableName, id, callback) {
      db.run(`DELETE FROM ${tableName} WHERE id = ?`, id, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, {
          deletedID: this.changes,
        });
      });
    }
  
  }

module.exports = BaseRepository;


