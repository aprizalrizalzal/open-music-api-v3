const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelPlaylists, mapDBToModelPlaylistSongs } = require('../../utils');

class PlaylistsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async createPlaylists({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlists gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async readPlaylists(owner) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists 
      LEFT JOIN users ON playlists.owner = users.id 
      WHERE playlists.owner = $1 OR users.id = $1 
      GROUP BY playlists.id, users.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }

    return result.rows.map(mapDBToModelPlaylists);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistsOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }

    const playlists = result.rows[0];
    if (playlists.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async createPlaylistSongsById({ playlistId, songId }) {
    await this._songsService.verifySongsExists(songId);

    const id = `playlist-songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Songs gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async readPlaylistSongsById(id) {
    const query = {
      text: `SELECT playlist_songs.*, playlists.name, playlists.owner, users.username,songs.title, songs.performer FROM playlist_songs 
      LEFT JOIN playlists ON playlist_songs.playlist_id  = playlists.id LEFT JOIN users ON playlists.owner = users.id LEFT JOIN songs ON playlist_songs.song_id = songs.id  
      WHERE playlist_songs.playlist_id = $1 OR playlists.id = $1
      GROUP BY playlist_songs.id, playlist_songs.playlist_id, playlist_songs.song_id, playlists.name, playlists.owner, users.username, songs.title, songs.performer`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }

    return result.rows.map(mapDBToModelPlaylistSongs);
  }

  async deletePlaylistSongsById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Songs gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
