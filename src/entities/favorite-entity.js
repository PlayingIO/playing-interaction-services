import Entity from 'mostly-entity';

const FavoriteEntity = new Entity('Favorite');

FavoriteEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default FavoriteEntity.asImmutable();
