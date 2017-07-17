import assert from 'assert';
import makeDebug from 'debug';
import { filter, unionWith } from 'lodash';
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

  find(params) {
    params = params || { query: {} };
    if (params.query.id) {
      return this.get(params.query.id).then((col) => col.entries);
    }
    return super.find(params);
  }

  suggestion(id, data, params) {
    return super.find(params);
  }

  addToCollection(id, data, params, original) {
    assert(data.document, 'data.document not provided.');

    const documents = this.app.service('documents');
    return documents.get(data.document).then((doc) => {
      if (!doc) throw new Error('data.document not exists');
      let entries = unionWith(
        original.entries || [],
        [{ id: doc.id, type: doc.type }],
        (entry, other) => String(entry.id) === String(other.id)
      );
      debug('addToCollection', entries);
      return super.patch(id, { entries: entries });
    });
  }

  removeFromCollection(id, data, params, original) {
    assert(data.document, 'data.document not provided.');

    const documents = this.app.service('documents');
    return documents.get(data.document).then((doc) => {
      if (!doc) throw new Error('data.document not exists');
      let entries = filter(
        original.entries || [],
        (entry) => String(entry.id) === data.document
      );
      debug('removeFromCollection', entries);
      return super.patch(id, { entries: entries });
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
