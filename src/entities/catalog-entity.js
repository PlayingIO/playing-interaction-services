import Entity from 'mostly-entity';

const CatalogEntity = new Entity('Catalog');

CatalogEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default CatalogEntity.asImmutable();
