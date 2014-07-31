module.exports = function(assets) {
  assets.root = __dirname;
  assets.addJs('/public/js/jquery.min.js');
  assets.addJs('/public/js/bootstrap.js');
  assets.addJs('/public/js/ejs_production.js');
  assets.addJs('/public/js/prettify.js');
  assets.addJs('/public/js/site.js');
    
  assets.addCss('/public/css/reset.css');
  assets.addCss('/public/css/bootstrap.css');
  assets.addCss('/public/css/bootstrap-responsive.css');
  assets.addCss('/public/css/prettify.css');
  assets.addCss('/public/css/site.css');


  assets.addJs('/public/js/jquery.min.js', 'metroJS');
  assets.addJs('/public/js/metrocss/**', 'metroJS');

  assets.addCss('/public/css/metrocss/**', 'metroCSS');
}