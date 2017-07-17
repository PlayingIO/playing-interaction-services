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

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  suggestion(id, data, params) {
    return super.find(params);
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
