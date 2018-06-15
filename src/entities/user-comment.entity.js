import Entity from 'mostly-entity';

const UserCommentEntity = new Entity('UserComment');

UserCommentEntity.excepts('_id');

export default UserCommentEntity.asImmutable();
