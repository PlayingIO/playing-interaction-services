import assert from 'assert';

export const collectionEnrichers = (options) => (hook) => {
  assert(hook.type === 'after', `collectionEnrichers must be used as a 'after' hook.`);

  // If no enrichers-document header then skip this hook
  if (!(hook.params.headers && hook.params.headers['enrichers-document'])) {
    return hook;
  }

  let enrichers = hook.params.headers['enrichers-document'].split(',').map(e => e.trim());
  let results = [].concat(hook.result && hook.result.data || hook.result || []);
  
  if (enrichers.indexOf('permissions') > -1) {
    results.forEach((doc) => {
      doc.metadata = doc.metadata || {};
      doc.metadata.permissions = doc.metadata.permissions || [];
      doc.metadata.permissions.push('ReadCanCollect');
    });
  }
  return hook;
};