import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from 'playing-content-services/lib/helpers';
import BlobEntity from 'playing-content-services/lib/entities/blob-entity';
import { DocTypes } from '~/constants';

const CollectionEntity = new Entity('Collection', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

CollectionEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

CollectionEntity.expose('metadata', {}, obj => {
  if (obj.metadata) return obj.metadata;
  
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = DocTypes[obj.type].facets;
  const favorites = [];
  const packages = DocTypes[obj.type].packages;
  const permissions = ['Everything', 'Read', 'Write', 'ReadWrite', 'ReadChildren', 'AddChildren', 'RemoveChildren'];
  const subtypes = Object.values(pick(DocTypes, ['File']));
  const thumbnail = {
    url: 'bower_components/playing-content-elements/images/icons/collection.png'
  };
  return Object.assign({}, { breadcrumbs, facets, favorites, packages, permissions, subtypes, thumbnail });
});

CollectionEntity.excepts('destroyedAt');

export default CollectionEntity.asImmutable();
