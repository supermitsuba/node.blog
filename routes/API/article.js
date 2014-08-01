
module.exports = function (app) {
  app.get('/api/article', hello);
};

function hello(req, res) {
  res.send('Hello world');
}
