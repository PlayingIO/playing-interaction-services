import Entity from 'mostly-entity';

const UserCommentEntity = new Entity('UserComment');

UserCommentEntity.discard('_id');

export default UserCommentEntity.freeze();
