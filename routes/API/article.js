
module.exports = function (app, dataProvider) {
  app.get('/api/article', hello);
};

function hello(req, res) {
  res.send('Hello world');
}
