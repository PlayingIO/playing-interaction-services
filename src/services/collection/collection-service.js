import assert from 'assert';
import makeDebug from 'debug';
import { unionWith } from 'lodash';
import { Service, createService } from 'mostly-feathers-mongoose';
import CollectionModel from '~/models/collection-model';
import defaultHooks from './collection-hooks';

const debug = makeDebug('playing:interaction-services:collections');

const defaultOptions = {
  name: 'collection-service'
};

class CollectionService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  suggestion(id, data, params) {
    return super.find(params);
  }

  addToCollection(id, data, params, original) {
    assert(data.params && data.params.document, 'params.document not provided.');

    const documents = this.app.service('documents');
    return documents.get(data.params.document).then((doc) => {
      if (!doc) throw new Error('params.document not exists');
      let entries = unionWith(
        original.entries || [],
        [{ id: doc.id, type: doc.type }],
        (entry, other) => String(entry.id) === String(other.id)
      );
      debug('addToCollection', entries);
      return super.patch(id, { entries: entries });
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
