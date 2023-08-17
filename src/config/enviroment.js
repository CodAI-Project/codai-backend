const dotenv = require("dotenv");
const functions = require("firebase-functions");
const enviroment = functions.config();
const config = enviroment === "production" ? "prod": "dev";


const env = (dotenv.config({path: `./env.${config}`})).parsed;
console.info(`Ambiente configurado ${enviroment}`);


module.exports = env;
