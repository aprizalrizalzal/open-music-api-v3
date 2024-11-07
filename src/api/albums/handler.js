class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
  }

  async postAlbumsHandler(request, h) {
    this._validator.validateAlbumsPayload(request.payload);
    const { name = 'untitled', year } = request.payload;
    const albumId = await this._service.createAlbums({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Albums berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.readAlbumsById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumsByIdHandler(request) {
    this._validator.validateAlbumsPayload(request.payload);
    const { id } = request.params;
    await this._service.updateAlbumsById(id, request.payload);
    return {
      status: 'success',
      message: 'Albums berhasil diperbarui',
    };
  }

  async deleteAlbumsByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumsById(id);
    return {
      status: 'success',
      message: 'Albums berhasil dihapus',
    };
  }

  // uploads cover
  async postAlbumCoversHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateCoverHeaders(cover.hapi.headers);

    const { id } = request.params;
    await this._service.verifyAlbumsExists(id);

    const covers = await this._storageService.writeFile(cover, cover.hapi);

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${covers}`;
    await this._service.updateAlbumCoversById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  // album likes
  async postAlbumLikesByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.verifyAlbumsExists(albumId);
    const userAlbumDislikes = await this._service.verifyAlbumLikesExists(credentialId, albumId);

    if (userAlbumDislikes) {
      const userAlbumLikes = await this._service.deleteAlbumLikesById(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Albums berhasil batal disukai',
        data: {
          userAlbumLikes,
        },
      });

      response.code(201);
      return response;
    }
    const userAlbumLikes = await this._service.createAlbumLikesById(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Albums berhasil disukai',
      data: {
        userAlbumLikes,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const userAlbumLikes = await this._service.readAlbumLikesById(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes: userAlbumLikes.count,
      },
    });
    response.header('X-Data-Source', userAlbumLikes.source);
    return response;
  }
}

module.exports = AlbumsHandler;
