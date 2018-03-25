import Entity from 'mostly-entity';

const UserShareEntity = new Entity('UserShare');

UserShareEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserShareEntity.asImmutable();
