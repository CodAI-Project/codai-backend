import generatorCodeRouter from "../routers/generator-code-router.js";

const setupRoutes = (server) => {
  server.use("/", generatorCodeRouter);
  server.use("/code", generatorCodeRouter);
};

export default setupRoutes;
