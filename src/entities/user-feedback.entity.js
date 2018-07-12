const Entity = require('mostly-entity');

const UserFeedbackEntity = new Entity('UserFeedback');

UserFeedbackEntity.discard('_id');

module.exports = UserFeedbackEntity.freeze();
