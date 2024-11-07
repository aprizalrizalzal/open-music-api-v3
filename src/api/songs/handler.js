class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongsHandler(request, h) {
    this._validator.validateSongsPayload(request.payload);
    const {
      title = 'untitled', year, performer, genre, duration,
    } = request.payload;
    const songId = await this._service.createSongs({
      title, year, performer, genre, duration,
    });
    const response = h.response({
      status: 'success',
      message: 'Songs berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler() {
    const songs = await this._service.readSongs();
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongsByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.readSongsById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongsByIdHandler(request) {
    this._validator.validateSongsPayload(request.payload);
    const { id } = request.params;
    await this._service.updateSongsById(id, request.payload);
    return {
      status: 'success',
      message: 'Songs berhasil diperbarui',
    };
  }

  async deleteSongsByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongsById(id);
    return {
      status: 'success',
      message: 'Songs berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
