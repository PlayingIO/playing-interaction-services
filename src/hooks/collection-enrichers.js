import assert from 'assert';
import { helpers } from 'mostly-feathers-mongoose';

export default function collectionEnrichers (options) {
  return context => {
    assert(context.type === 'after', `collectionEnrichers must be used as a 'after' hook.`);

    // If no enrichers-document header then skip this hook
    if (!(context.params.headers && context.params.headers['enrichers-document'])) {
      return context;
    }

    const enrichers = context.params.headers['enrichers-document']
      .split(',').map(e => e.trim());

    if (enrichers.indexOf('permissions') > -1) {
      const data = helpers.getHookDataAsArray(context);
      data.forEach(doc => {
        doc.metadata = doc.metadata || {};
        doc.metadata.permissions = doc.metadata.permissions || [];
        doc.metadata.permissions.push('ReadCanCollect');
      });
    }
    return context;
  };
}