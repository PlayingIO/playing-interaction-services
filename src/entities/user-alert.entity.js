const Entity = require('mostly-entity');

const UserAlertEntity = new Entity('UserAlert');

UserAlertEntity.discard('_id');

module.exports = UserAlertEntity.freeze();
