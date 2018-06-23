import Entity from 'mostly-entity';

const UserCollectionEntity = new Entity('UserCollection');

UserCollectionEntity.discard('_id');

export default UserCollectionEntity.freeze();
