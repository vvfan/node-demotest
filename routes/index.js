
/*
 * GET home page.
 */

exports.index = function(req, res){
  options={
    'title':'express',
    'content':'this is content'
  };
  res.render('index', options);
};