import assert from 'assert';
import { helpers } from 'mostly-feathers-mongoose';

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