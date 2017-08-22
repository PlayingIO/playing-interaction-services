import makeDebug from 'debug';
import fp from 'ramda';

const debug = makeDebug('playing:interaction-services:favorite:events');

const createActivity = function(app, favorite, verb, message) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  const documents = app.service('documents');

  return fp.map((document) => {
    return feeds.get(`document:${document}`).then((feed) => {
      if (feed) {
        activities.create({
          feed: feed.id,
          actor: `user:${favorite.creator}`,
          verb: verb,
          object: `document:${document}`,
          foreignId: `favorite:${favorite.id}`,
          message: message,
          cc: [`user:${favorite.creator}`]
        });
      }
    });
  });
};

export function subFavoriteEvents(app, options) {
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.added'
  }, (resp) => {
    const favorite = resp.event;
    debug('favorite.added', favorite);
    if (favorite) {
      const create = createActivity(app, favorite, 'addedToFavorites', 'favorite the document');
      create([].concat(favorite.document));
    }
  });
}

export function subUnFavoriteEvents(app, options) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'favorite.removed'
  }, (resp) => {
    const favorite = resp.event;
    debug('favorite.removed', favorite);
    if (favorite) {
      const create = createActivity(app, favorite, 'removeFromFavorites', 'unfavorite the document');
      create([].concat(favorite.document));
    }
  });
}
