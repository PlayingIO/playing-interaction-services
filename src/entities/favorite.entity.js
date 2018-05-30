import Entity from 'mostly-entity';
import fp from 'mostly-func';
import { BlobEntity, DocTypes } from 'playing-content-common';

const FavoriteEntity = new Entity('Favorite', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FavoriteEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return fp.omit(['parent'], obj.parent);
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
