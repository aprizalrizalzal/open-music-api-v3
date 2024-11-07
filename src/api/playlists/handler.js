class PlaylistsHandler {
  constructor(service, producerService, validator) {
    this._service = service;
    this._producerService = producerService;
    this._validator = validator;
  }

  async postPlaylistsHandler(request, h) {
    this._validator.validatePlaylistsPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.createPlaylists({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.readPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlists berhasil dihapus',
    };
  }

  async postPlaylistSongsByIdHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsOwner(playlistId, credentialId);
    const { songId } = request.payload;

    const playlistSongs = await this._service.createPlaylistSongsById({ playlistId, songId });

    const response = h.response({
      status: 'success',
      message: 'Playlist Songs berhasil ditambahkan',
      data: {
        playlistSongs,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsOwner(playlistId, credentialId);
    const playlistSongs = await this._service.readPlaylistSongsById(playlistId);

    const songs = playlistSongs.map((song) => ({
      id: song.songId,
      title: song.title,
      performer: song.performer,
    }));

    const playlists = playlistSongs.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs,
    }))[0];

    return {
      status: 'success',
      data: {
        playlist: playlists,
      },
    };
  }

  async deletePlaylistSongsByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsOwner(playlistId, credentialId);
    await this._service.deletePlaylistSongsById(playlistId, songId);

    return {
      status: 'success',
      message: 'Playlist Songs berhasil dihapus',
    };
  }

  // export playlists
  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsOwner(playlistId, credentialId);

    const message = {
      playlistId: request.params.id,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = PlaylistsHandler;
