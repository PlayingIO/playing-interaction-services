import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import fp from 'mostly-func';
import { getBreadcrumbs } from 'playing-content-services/lib/helpers';
import BlobEntity from 'playing-content-services/lib/entities/blob-entity';
import { DocTypes } from '~/constants';

const FavoriteEntity = new Entity('Favorite', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FavoriteEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

FavoriteEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  if (Types[obj.type]) {
    obj.metadata.facets = Types[obj.type].facets;
    obj.metadata.packages = Types[obj.type].packages;
  }

  return fp.sortKeys(obj.metadata);
});

FavoriteEntity.excepts('destroyedAt');

export default FavoriteEntity.asImmutable();
