const PlaylistsHandler = require('./handler');
const playlistRoutes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, producerService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, producerService, validator);
    server.route(playlistRoutes(playlistsHandler));
  },
};
