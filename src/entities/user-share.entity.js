import Entity from 'mostly-entity';

const UserShareEntity = new Entity('UserShare');

UserShareEntity.excepts('_id');

export default UserShareEntity.asImmutable();
