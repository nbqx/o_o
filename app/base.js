var vm = require('vm');
var _ = require('underscore');
var determineContext = require('./middles/determineContext');

module.exports = function(app){

  // top
  app.get('/',function(req,res){
    res.render('index', {script: ''+req.flash('script'), error: ''+req.flash('error'), info: ''+req.flash('info')});
  });

  // exec script as test-flight
  app.post('/test-flight', determineContext, function(req, res){
    process.send('start');

    var fn_name = ''+req.body.fnname;
    var src = ''+req.body.code;
    var code = (_.template("'use strict';(<%= src %>)(req, res)"))({src: src});
    var cxt = {req: req, res: res};

    if(req.hasContext()) cxt = req.myContext;
  
    try{
      var proc = vm.createScript(code);
      proc.runInNewContext(cxt);
    }catch(e){
      req.flash('error',''+e);
      req.flash('script',src);
      res.redirect('/');
    }

    process.send('done');
  });
};
