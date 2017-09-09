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
  
  _suggestion(id, data, params) {
    return super.find(params);
  }

  /*
   * reorder items in the collection
   */
  _moveCollectionMember(id, data, params, original) {
    assert(data.select, 'data.select is not provided.');
    assert(data.target, 'data.target is not provided.');

    const catalogs = this.app.service('catalogs');

    return Promise.all(
      [data.select, data.target].map(item => {
        return catalogs.first({ query: {
          document: item,
          parent: original.id
        }});
      })
    ).then(([select, target]) => {
      debug('moveCollectionMember', select, target);
      if (!select) throw new Error('data.select document not exists.');
      if (!target) throw new Error('data.target document not exists.');
      return catalogs.patch(select.id, {
        target: target.id
      }, {
        __action: 'reorder'
      });
    }).then(() => original);
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
