import Entity from 'mostly-entity';

const UserFeedbackEntity = new Entity('UserFeedback');

UserFeedbackEntity.excepts('_id');

export default UserFeedbackEntity.asImmutable();
