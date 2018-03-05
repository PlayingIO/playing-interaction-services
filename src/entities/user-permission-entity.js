import Entity from 'mostly-entity';

const UserPermissionEntity = new Entity('UserPermission');

UserPermissionEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default UserPermissionEntity.asImmutable();
