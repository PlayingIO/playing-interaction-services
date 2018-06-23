import Entity from 'mostly-entity';

const UserFeedbackEntity = new Entity('UserFeedback');

UserFeedbackEntity.discard('_id');

export default UserFeedbackEntity.freeze();
