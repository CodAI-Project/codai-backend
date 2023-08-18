import resource from './resources.js'

export default server => {
  server.use("/", resource);
};


