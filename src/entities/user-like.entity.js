import Entity from 'mostly-entity';

const UserLikeEntity = new Entity('UserLike');

UserLikeEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserLikeEntity.asImmutable();
