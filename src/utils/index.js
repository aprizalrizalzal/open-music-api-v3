const mapDBToModelAlbums = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

const mapDBToModelSongs = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBToModelDetailSongs = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToModelPlaylists = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapDBToModelPlaylistSongs = ({
  playlist_id,
  name,
  username,
  song_id,
  title,
  performer,
}) => ({
  id: playlist_id,
  name,
  username,
  songId: song_id,
  title,
  performer,
});

module.exports = {
  mapDBToModelAlbums,
  mapDBToModelSongs,
  mapDBToModelDetailSongs,
  mapDBToModelPlaylists,
  mapDBToModelPlaylistSongs,
};
