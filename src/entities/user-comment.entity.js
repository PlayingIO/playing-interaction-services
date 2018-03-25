import Entity from 'mostly-entity';

const UserCommentEntity = new Entity('UserComment');

UserCommentEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserCommentEntity.asImmutable();
