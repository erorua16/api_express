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
        const columnNames = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).fill('?').join(', ');
        
        const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
        const params = Object.values(data);
        
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
        const columnNames = Object.keys(data).filter(key => key !== 'id').map(key => `${key} = ?`).join(', ');
        const params = Object.values(data);
        
        const sql = `UPDATE ${tableName} SET ${columnNames} WHERE id = ?`;
        
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
        const params = [id];
        db.run(`DELETE FROM ${tableName} WHERE id = ?`, params, function (err) {
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


