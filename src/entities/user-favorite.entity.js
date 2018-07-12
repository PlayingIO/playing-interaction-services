const Entity = require('mostly-entity');

const UserFavoriteEntity = new Entity('UserFavorite');

UserFavoriteEntity.discard('createdAt', 'updatedAt', 'destroyedAt');

module.exports = UserFavoriteEntity.freeze();
