const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
      console.error("Error opening database: " + err.message);
      return;
    }
  
    db.run(`CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL
    )`, (err) => {
      if (err) {
        console.error("Error creating table: " + err.message);
        return;
      }
    });
  
    db.run(`CREATE TABLE IF NOT EXISTS actors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      date_of_death DATE
    )`, (err) => {
      if (err) {
        console.error("Error creating table: " + err.message);
        return;
      }
      
      console.log("Actors table created successfully.");
    });
  
    db.run(`CREATE TABLE IF NOT EXISTS films (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      synopsis TEXT NOT NULL,
      release_year INTEGER,
      genre_id INTEGER NOT NULL,
      FOREIGN KEY (genre_id) REFERENCES genres(id)
    )`, (err) => {
      if (err) {
        console.error("Error creating table: " + err.message);
        return;
      }
      
      console.log("Films table created successfully.");
    });
  
    db.run(`CREATE TABLE IF NOT EXISTS films_actors (
      film_id INTEGER,
      actor_id INTEGER,
      FOREIGN KEY (film_id) REFERENCES films(id),
      FOREIGN KEY (actor_id) REFERENCES actors(id),
      PRIMARY KEY (film_id, actor_id)
    )`, (err) => {
      if (err) {
        console.error("Error creating table: " + err.message);
        return;
      }
      
      console.log("Films_Actors table created successfully.");
    });
  });
  module.exports = db;
