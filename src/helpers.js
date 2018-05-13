import assert from 'assert';
import { helpers } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';

export const getSubjects = async (app, type, ids, params) => {
  const svcDocuments = app.service(plural(type));
  const subjects = await svcDocuments.find({
    query: { _id: { $in: ids }, $select: ['type'] },
    user: params.user,
    paginate: false,
  });
  if (!subjects || subjects.length !== ids.length) {
    throw new Error('some data.subject(s) not exists');
  }
  return subjects;
};

export const getCollection = async (app, id, params) => {
  const svcCollections = app.service('favorites');
  const collection = await svcCollections.get(id, {
    query: { $select: ['id'] },
    user: params.user,
  });
  if (!collection) {
    throw new Error('collection is not exists');
  }
  return collection;
};

export const getFavorite = async (app, params) => {
  const svcFavorites = app.service('favorites');
  const favorite = await svcFavorites.get('me', {
    query: { $select: ['id'] },
    user: params.user,
  });
  if (!favorite) {
    throw new Error('favorite collection is not exists');
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