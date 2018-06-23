import Entity from 'mostly-entity';

const UserLikeEntity = new Entity('UserLike');

UserLikeEntity.discard('_id');

export default UserLikeEntity.freeze();
