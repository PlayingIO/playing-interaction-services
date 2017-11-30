import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from 'playing-content-services/lib/helpers';
import BlobEntity from 'playing-content-services/lib/entities/blob-entity';
import { DocTypes } from '~/constants';

const WorkspaceEntity = new Entity('Workspace', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

WorkspaceEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  if (Types[obj.type]) {
    obj.metadata.facets = Types[obj.type].facets;
    obj.metadata.packages = Types[obj.type].packages;
  }

  return obj.metadata;
});

WorkspaceEntity.excepts('destroyedAt');

export default WorkspaceEntity.asImmutable();
