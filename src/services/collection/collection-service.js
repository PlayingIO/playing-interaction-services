import assert from 'assert';
import makeDebug from 'debug';
import { filter, unionWith } from 'lodash';
import { Service, createService } from 'mostly-feathers-mongoose';
import CollectionModel from '~/models/collection-model';
import defaultHooks from './collection-hooks';

const debug = makeDebug('playing:interaction-services:collections');

const defaultOptions = {
  name: 'collections'
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
  
  get(id, params) {
    params.$select = params.$select || [];
    
    let collection = null;
    
    return super.get(id, params).then((result) => {
      collection = result;

      if (collection && params.$select.indexOf('entries') > -1) {
        const entries = this.app.Service('collection-entries');
        return entries.find({ query: {
          parent: collection.id
        }});
      } else {
        return null;
      }
    }).then((results) => {
      if (results) {
        collection.entries = results.data || results;
      }
      return collection;
    });
  }

  suggestion(id, data, params) {
    return super.find(params);
  }

  moveCollectionMember(id, data, params, original) {
    assert(data.select, 'data.select is not provided.');
    assert(data.target, 'data.target is not provided.');

    const entries = this.app.service('collection-entries');

    return Promise.all(
      [data.select, data.target].map(entry => {
        return entries.first({ query: {
          entry: entry,
          parent: original.id
        }});
      })
    ).then(([select, target]) => {
      debug('moveCollectionMember', select, target);
      if (!select) throw new Error('data.select entry not exists.');
      if (!target) throw new Error('data.target entry not exists.');
      return entries.patch(select._id,
        { target: target._id },
        { __action: 'reorder' });
    }).then(() => original);
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
