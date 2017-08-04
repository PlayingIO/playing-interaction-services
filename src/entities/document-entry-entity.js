import Entity from 'mostly-entity';

const DocumentEntryEntity = new Entity('DocumentEntry');

DocumentEntryEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default DocumentEntryEntity.asImmutable();
