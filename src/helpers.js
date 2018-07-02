import assert from 'assert';
import { helpers } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';

export const getSubjects = async (app, type, ids) => {
  const svcDocuments = app.service(plural(type));
  const subjects = await svcDocuments.find({
    query: { _id: { $in: ids }, $select: ['type'] },
    paginate: false,
  });
  if (!subjects || subjects.length !== ids.length) {
    throw new Error('some data.subject(s) not exists');
  }
  return subjects;
};

export const getCollection = async (app, id, user) => {
  const svcCollections = app.service('collections');
  const collection = await svcCollections.get(id, {
    query: { user, $select: ['id'] }
  });
  if (!collection) {
    throw new Error('collection is not exists');
  }
  return collection;
};

export const getFavorite = async (app, user) => {
  const svcFavorites = app.service('favorites');
  const favorite = await svcFavorites.get('me', {
    query: { user, $select: ['id'] }
  });
  if (!favorite) {
    throw new Error('Favorite collection is not exists');
  }
  return favorite;
};

// create a interaction activity
export const createInteractionActivity = (context, interaction, subject, custom) => {
  const actor = helpers.getId(interaction.user);
  return {
    actor: `user:${actor}`,
    object: `${subject.type}:${subject.id}`,
    foreignId: `${interaction.type}:${interaction.id}`,
    time: new Date().toISOString(),
    ...custom
  };
};