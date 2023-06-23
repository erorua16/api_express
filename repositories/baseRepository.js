const db = require("../database");

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
    const columnNames = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).fill("?").join(", ");

    // Retrieve column information from the database schema
    const sql = `PRAGMA table_info(${tableName})`;
    db.all(sql, [], (err, columns) => {
      if (err) {
        callback(err);
        return;
      }

      const allowedColumns = columns.map((column) => column.name.toLowerCase());

      const invalidColumns = columnNames
        .split(", ")
        .filter((key) => !allowedColumns.includes(key.toLowerCase()));

      if (invalidColumns.length > 0) {
        const error = new Error(
          `Invalid columns: ${invalidColumns.join(", ")}`
        );
        callback(error);
        return;
      }

      const insertSql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
      const params = Object.values(data);

      db.run(insertSql, params, (err) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, {
          id: this.lastID,
        });
      });
    });
  }

  update(tableName, data, callback) {
    const columnNames = Object.keys(data).filter((key) => key !== "id");

    // Check if the record exists
    const checkExistsSql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id = ?`;
    db.get(checkExistsSql, [data.id], (err, result) => {
      if (err) {
        callback(err);
        return;
      }

      const recordExists = result.count > 0;

      if (!recordExists) {
        const error = new Error(`Record not found with id: ${data.id}`);
        error.status = 404;
        callback(error);
        return;
      }

      const sql = `PRAGMA table_info(${tableName})`;
      db.all(sql, [], (err, columns) => {
        if (err) {
          callback(err);
          return;
        }

        const allowedColumns = columns.map((column) =>
          column.name.toLowerCase()
        );

        const invalidColumns = columnNames.filter(
          (key) => !allowedColumns.includes(key.toLowerCase())
        );

        if (invalidColumns.length > 0) {
          const error = new Error(
            `Invalid columns: ${invalidColumns.join(", ")}`
          );
          error.status = 422;
          callback(error);
          return;
        }

        const updateColumns = columnNames.map((key) => `${key} = ?`).join(", ");
        const params = columnNames.map((key) => data[key]);
        const updateSql = `UPDATE ${tableName} SET ${updateColumns} WHERE id = ?`;

        db.run(updateSql, [...params, data.id], function (err) {
          if (err) {
            callback(err);
            return;
          }

          callback(null, {
            updatedID: this.changes,
          });
        });
      });
    });
  }

  delete(tableName, id, callback) {
    // Check if the record exists
    const checkExistsSql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id = ?`;
    db.get(checkExistsSql, [id], (err, result) => {
      if (err) {
        callback(err);
        return;
      }

      const recordExists = result.count > 0;

      if (!recordExists) {
        const error = new Error(`Record not found with id: ${id}`);
        error.status = 404;
        callback(error);
        return;
      }

      const deleteSql = `DELETE FROM ${tableName} WHERE id = ?`;
      db.run(deleteSql, [id], function (err) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, {
          deletedID: this.changes,
        });
      });
    });
  }
}

module.exports = BaseRepository;
