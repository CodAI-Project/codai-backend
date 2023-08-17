const routers = require("../routers/sessao-router");


module.exports = (server) => {
  server.use("/", routers),
  server.use("/codai", routers);
};
