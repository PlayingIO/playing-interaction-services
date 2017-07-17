import Entity from 'mostly-entity';

const CollectionEntryEntity = new Entity('CollectionEntry');

CollectionEntryEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default CollectionEntryEntity.asImmutable();
