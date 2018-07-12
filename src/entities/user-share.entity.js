const Entity = require('mostly-entity');

const UserShareEntity = new Entity('UserShare');

UserShareEntity.discard('_id');

module.exports = UserShareEntity.freeze();
