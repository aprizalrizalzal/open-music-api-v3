const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbums } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async createAlbums({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Albums gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async readAlbumsById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Albums tidak ditemukan');
    }

    return result.rows.map(mapDBToModelAlbums)[0];
  }

  async updateAlbumsById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
    }
  }

  async deleteAlbumsById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Albums gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyAlbumsExists(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Albums tidak ditemukan');
    }
  }

  async updateAlbumCoversById(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
    }
  }

  async createAlbumLikesById(userId, albumId) {
    const id = `user-album-likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Albums gagal disukai');
    }

    await this._cacheService.delete(`user_album_likes: ${albumId}`);

    return result.rows[0].id;
  }

  async readAlbumLikesById(albumId) {
    try {
      const result = await this._cacheService.get(`user_album_likes: ${albumId}`);
      return {
        count: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`user_album_likes: ${albumId}`, JSON.stringify(result.rowCount));

      return {
        count: result.rowCount,
        source: 'database',
      };
    }
  }

  async deleteAlbumLikesById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING user_id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Albums likes gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`user_album_likes: ${albumId}`);
  }

  async verifyAlbumLikesExists(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = AlbumsService;
