const Joi = require('joi');

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = {
  PlaylistsPayloadSchema,
  PlaylistSongsPayloadSchema,
  ExportPlaylistsPayloadSchema,
};
