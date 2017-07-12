import { Service, createService } from 'mostly-feathers-mongoose';
import FavoriteModel from '~/models/favorite-model';
import defaultHooks from './favorite-hooks';

const defaultOptions = {
  name: 'favorite-service'
};

class FavoriteService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks);
  }

}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'favorite' }, options);
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
