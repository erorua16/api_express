const BaseRepository = require('./baseRepository');

class ActorRepository extends BaseRepository {
    constructor() {
        super();
        this.tableName = 'actors';
      }
}

module.exports = ActorRepository;
