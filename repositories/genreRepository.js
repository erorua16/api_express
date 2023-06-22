const BaseRepository = require('./baseRepository');

class GenresRepository extends BaseRepository {
    constructor() {
      super();
      this.tableName = 'genres';
    }
  
  }
  

module.exports = GenresRepository;
