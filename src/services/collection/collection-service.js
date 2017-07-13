import { Service, createService } from 'mostly-feathers-mongoose';
import CollectionModel from '~/models/collection-model';
import defaultHooks from './collection-hooks';

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
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'collection' }, options);
  return createService(app, CollectionService, CollectionModel, options);
}

init.Service = CollectionService;
