import Entity from 'mostly-entity';

const UserAlertEntity = new Entity('UserAlert');

UserAlertEntity.excepts('_id');

export default UserAlertEntity.asImmutable();
