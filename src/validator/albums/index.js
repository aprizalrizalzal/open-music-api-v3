const InvariantError = require('../../exceptions/InvariantError');
const { AlbumsPayloadSchema, CoverHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumsPayload: (payload) => {
    const validationResult = AlbumsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateCoverHeaders: (headers) => {
    const validationResult = CoverHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
