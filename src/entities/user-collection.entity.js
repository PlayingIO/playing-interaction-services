import Entity from 'mostly-entity';

const UserCollectionEntity = new Entity('UserCollection');

UserCollectionEntity.excepts('_id');

export default UserCollectionEntity.asImmutable();
