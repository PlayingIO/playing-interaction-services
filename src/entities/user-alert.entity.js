import Entity from 'mostly-entity';

const UserAlertEntity = new Entity('UserAlert');

UserAlertEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserAlertEntity.asImmutable();
