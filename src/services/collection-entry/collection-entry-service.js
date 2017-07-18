import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import CollectionEntryModel from '~/models/collection-entry-model';
import { populateByService } from 'playing-content-services/lib/helpers';
import defaultHooks from './collection-entry-hooks';

const debug = makeDebug('playing:interaction-services:collection-entries');

const defaultOptions = {
  name: 'collection-entries'
};

class CollectionEntryService extends Service {
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
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params).then((results) => {
      let documents = results.data || results;
      if (documents && documents.length > 0) {
        return populateByService(this.app, documents, 'entry', 'type', {
          provider: params.provider,
          headers: params.headers
        });
      } else {
        return [];
      }
    });
  }

  create(data, params) {
    assert(data.collection, 'data.collection not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.owner, 'data.owner not provided.');

    const documents = this.app.service('documents');
    const collections = this.app.service('collections');
    
    const entries = [].concat(data.document || data.documents);

    return Promise.all([
      documents.find({ query: {
        _id: { $in: entries }
      }}),
      collections.get(data.collection),
    ]).then(([results, col]) => {
      let docs = results.data || results;
      if (!docs || docs.length !== entries.length) throw new Error('some data.document not exists');
      if (!col) throw new Error('data.collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert({
          entry: doc.id,
          parent: data.collection,
          type: doc.type,
          owner: data.owner
        });
      }));
    });
  }

  remove(id, params) {
    assert(params.query.collection, 'query.collection not provided.');
    assert(params.query.document, 'query.document not provided.');
    assert(params.query.owner, 'query.owner not provided.');

    return super.remove(null, {
      query: {
        entry: params.query.document,
        parent: params.query.collection,
        owner: params.query.owner
      },
      provider: params.provider,
      $multi: true
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection-entry' }, options);
  return createService(app, CollectionEntryService, CollectionEntryModel, options);
}

init.Service = CollectionEntryService;
