const BaseRepository = require('./baseRepository');

class filmActorsRepository extends BaseRepository {
    constructor() {
      super();
      this.tableName = 'films_actors';
    }
  
  }
  

module.exports = filmActorsRepository;
