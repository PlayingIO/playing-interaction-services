import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import LeaderboardModel from '~/models/user-permission-model';
import defaultHooks from './user-permission-hooks';

const debug = makeDebug('playing:interaction-services:user-permissions');

const defaultOptions = {
  name: 'user-permissions'
};

class PermissionService extends Service {
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
  options = Object.assign({ ModelName: 'user-permission' }, options);
  return createService(app, PermissionService, LeaderboardModel, options);
}

init.Service = PermissionService;
