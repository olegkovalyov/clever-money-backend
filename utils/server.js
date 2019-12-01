const start = (app) => {
  const port = process.env.PORT || 5000;
  return app.listen(port, () => console.log('Server started'.blue.bold));
};

const stop = (server, error = null) => {
  if (error) {
    console.log(error.name, error.message);
  }
  console.log('Shutting down...');
  server.close(() => {
    process.exit(1);
  });
};

exports.startServer = start;
exports.stopServer = stop;