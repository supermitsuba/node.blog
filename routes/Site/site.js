
module.exports = function (app) {
  app.get('/', hello);
};

function hello(req, res) {
  res.send('Hello world');
}

