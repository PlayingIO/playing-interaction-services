import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import UserLikeModel from '~/models/user-like-model';
import defaultHooks from './user-like-hooks';

const debug = makeDebug('playing:interaction-services:user-likes');

const defaultOptions = {
  name: 'user-likes'
};

class UserLikeService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  get(id, params) {
    params = Object.assign({ query: {} }, params);
    assert(params.query.user, 'params.query.user not provided');
    params.query.document = params.query.document || id;
    return super._first(null, null, params);
  }

  create(data, params) {
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.user, 'data.user not provided.');

    const documents = this.app.service('documents');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = documents.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      paginate: false,
    });

    return getDocuments.then((docs) => {
      if (!docs || docs.length !== ids.length) throw new Error('some data.document not exists');
      return Promise.all(docs.map((doc) => {
        return super._upsert(null, {
          document: doc.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove(id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.document, 'query.document not provided.');
      assert(params.query.user, 'query.user not provided.');

      return super.remove(null, {
        query: {
          document: { $in: params.query.document.split(',') },
          user: params.query.user
        },
        provider: params.provider,
        $multi: true
      });
    }
  }

}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'user-like' }, options);
  return createService(app, UserLikeService, UserLikeModel, options);
}

init.Service = UserLikeService;