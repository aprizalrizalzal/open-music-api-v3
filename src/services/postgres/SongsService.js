const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSongs, mapDBToModelDetailSongs } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async createSongs({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, year, performer, genre, duration],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Songs gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async readSongs() {
    const result = await this._pool.query('SELECT * FROM songs');
    return result.rows.map(mapDBToModelSongs);
  }

  async readSongsById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs tidak ditemukan');
    }

    return result.rows.map(mapDBToModelDetailSongs)[0];
  }

  async updateSongsById(id, {
    title, year, performer, genre, duration,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, performer, genre, duration, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui songs. Id tidak ditemukan');
    }
  }

  async deleteSongsById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifySongsExists(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs tidak ditemukan');
    }
  }
}

module.exports = SongsService;
