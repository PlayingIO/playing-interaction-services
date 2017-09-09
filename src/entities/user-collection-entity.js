import Entity from 'mostly-entity';

const UserCollectionEntity = new Entity('UserCollection');

UserCollectionEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserCollectionEntity.asImmutable();
