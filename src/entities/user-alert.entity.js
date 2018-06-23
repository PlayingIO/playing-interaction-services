import Entity from 'mostly-entity';

const UserAlertEntity = new Entity('UserAlert');

UserAlertEntity.discard('_id');

export default UserAlertEntity.freeze();
