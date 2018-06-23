import Entity from 'mostly-entity';

const UserFavoriteEntity = new Entity('UserFavorite');

UserFavoriteEntity.discard('createdAt', 'updatedAt', 'destroyedAt');

export default UserFavoriteEntity.freeze();
