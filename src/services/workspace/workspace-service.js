import assert from 'assert';
import makeDebug from 'debug';
import { createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import shortid from 'shortid';

import WorkspaceModel from '~/models/workspace-model';
import { Service } from '~/services/collection/collection-service';
import defaultHooks from './workspace-hooks';

const debug = makeDebug('playing:interaction-services:workspaces');

const defaultOptions = {
  name: 'workspaces'
};

/**
 * Workspace is a special folder
 */
class WorkspaceService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
  
  _getUserWorkspace(params) {
    params = fp.assign(params, { paginate: false });
    return super.find(params).then((result) => {
      // create own workspace if not exists
      if (result && result.length === 0) {
        assert(params.query.creator, 'params.query.creator not provided');
        let name = 'workspace-' + shortid.generate();
        return super.create({
          title: 'My Workspace',
          description: 'User workspace',
          creator: params.query.creator,
          path: '/folder-workspaces/' + name
        });
      } else {
        return result && result[0];
      }
    });
  }

  find(params) {
    params = params || { query: {} };
    
    return super.find(params);
  }

  get(id, params) {
    params = params || { query: {} };
    
    const action = params.__action;
    
    if (id === 'me') {
      assert(params.query.creator, 'query.creator not provided.');
      return this._getUserWorkspace(params).then((workspace) => {
        if (action) {
          assert(this[action], 'No such action method: ' + action);
          return this[action].call(this, id, {}, params, workspace);
        } else {
          return workspace;
        }
      });
    } else {
      return super.get(id, params);
    }
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'workspace' }, options);
  return createService(app, WorkspaceService, WorkspaceModel, options);
}

init.Service = WorkspaceService;
