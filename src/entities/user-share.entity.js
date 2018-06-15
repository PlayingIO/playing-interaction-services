import Entity from 'mostly-entity';

const UserShareEntity = new Entity('UserShare');

UserShareEntity.discard('_id');

export default UserShareEntity.asImmutable();
