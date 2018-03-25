import Entity from 'mostly-entity';

const UserFavoriteEntity = new Entity('UserFavorite');

UserFavoriteEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserFavoriteEntity.asImmutable();
