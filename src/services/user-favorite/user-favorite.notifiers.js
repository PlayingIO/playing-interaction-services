import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createInteractionActivity } from '../../helpers';

// create favorite activity
const createFavorite = (context) => {
  const userFavorites = helpers.getHookDataAsArray(context);
  const { subjects } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!userFavorites.length || !actor) return;

  const custom = {
    actor: `user:${actor}`,
    verb: 'favorite.create',
    message: 'Favorite the document',
  };
  return fp.map(favorite => {
    const subject = fp.findById(favorite.subject, subjects);
    return subject && [
      createInteractionActivity(context, favorite, subject, custom),
      `user:${actor}`,                   // add to actor's activity log
      `${subject.type}:${subject.id}`,   // add to document's activity log
      `notification:${subject.creator}`  // add to document author's notification stream
    ];
  }, userFavorites);
};

// delete favorite activity
const deleteFavorite = (context) => {
  const userFavorites = helpers.getHookDataAsArray(context);
  const { subjects } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!userFavorites.length || !actor) return;

  const custom = {
    actor: `user:${actor}`,
    verb: 'favorite.delete',
    message: 'Unfavorite the document',
  };
  return fp.map(favorite => {
    const subject = fp.findById(favorite.subject, subjects);
    return subject && [
      createInteractionActivity(context, favorite, subject, custom),
      `user:${actor}`,                   // add to actor's activity log
      `${subject.type}:${subject.id}`,   // add to document's activity log
      `notification:${subject.creator}`  // add to document author's notification stream
    ];
  }, userFavorites);
};

export default {
  'favorite.create': createFavorite,
  'favorite.delete': deleteFavorite
};

