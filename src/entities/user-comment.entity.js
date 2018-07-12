const Entity = require('mostly-entity');

const UserCommentEntity = new Entity('UserComment');

UserCommentEntity.discard('_id');

module.exports = UserCommentEntity.freeze();
