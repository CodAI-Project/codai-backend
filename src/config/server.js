const express = require("express");
const server = express();
const cors = require("cors");
const routes = require('./routes')
server.use(cors());

routes(server)

server.use(express.json());

module.exports = server;