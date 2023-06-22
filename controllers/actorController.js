const ActorRepository = require('../repositories/actorRepository');

class ActorController {
  constructor() {
    this.actorRepository = new ActorRepository();
  }

  getAll(req, res) {
    this.actorRepository.getAll(this.actorRepository.tableName, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  getById(req, res) {
    const actorId = req.params.id;

    this.actorRepository.getById(this.actorRepository.tableName, actorId, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      
      res.status(200).json({
        message: 'success',
        data: result,
        id: req.params.id,
      });      
    });
  }

  create(req, res) {
    const actorData = req.body;

    this.actorRepository.create(this.actorRepository.tableName, actorData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  update(req, res) {
    const actorId = req.params.id;
    const actorData = req.body;
    actorData.id = actorId;

    this.actorRepository.update(this.actorRepository.tableName, actorData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.updatedID === 0) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      res.status(200).json({
        message: 'success',
        data: result,
      });
    });
  }

  delete(req, res) {
    const actorId = req.params.id;

    this.actorRepository.delete(this.actorRepository.tableName, actorId, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.deletedID === 0) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      res.status(200).json({
        message: 'success',
        deletedID: result.deletedID,
      });
    });
  }
}

module.exports = ActorController;
