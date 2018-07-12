const Entity = require('mostly-entity');

const UserCollectionEntity = new Entity('UserCollection');

UserCollectionEntity.discard('_id');

module.exports = UserCollectionEntity.freeze();
