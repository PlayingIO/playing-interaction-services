import Entity from 'mostly-entity';

const UserFeedbackEntity = new Entity('UserFeedback');

UserFeedbackEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserFeedbackEntity.asImmutable();
