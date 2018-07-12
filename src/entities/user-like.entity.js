const Entity = require('mostly-entity');

const UserLikeEntity = new Entity('UserLike');

UserLikeEntity.discard('_id');

module.exports = UserLikeEntity.freeze();
