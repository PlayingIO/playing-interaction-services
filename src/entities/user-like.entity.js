import Entity from 'mostly-entity';

const UserLikeEntity = new Entity('UserLike');

UserLikeEntity.excepts('_id');

export default UserLikeEntity.asImmutable();
