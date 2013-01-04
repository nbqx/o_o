var express = require('express');
var app = express();
var flash = require('connect-flash');
var _ = require('underscore');

app.configure(function(){
  app.set('views',__dirname+'/views');
  app.set('view engine','jade');
  app.use(express.static(__dirname+"/public"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret:'yoyoyo'}));
  app.use(flash());
});

require('./base')(app);
require('./crud')(app); // コメントアウトすればdbをつかわないでうごく

// helper
app.locals({
  // ランダムでサンプルコードをゲト
  someCode: function(){
    var codes = [
      '\tvar ret = {success:true, text:\"this is test\"};\n\tres.setHeader("Content-Type","application/json");\n\tres.end(JSON.stringify(ret));\n',
      '\trequest("http://upload.wikimedia.org/wikipedia/en/1/1a/Blackflag84.jpg").pipe(res);\n',
      '\tvar txt = "これはテストです";\n\tres.redirect("http://twitter.com/home?status="+encodeURI(txt)+"&copytype=0");\n',
      '\tres.end(encodeURI("これはテストです"));\n',
      '\tvar text = req.query.text;\n\tif(text){\n\t\tres.end(text);\n\t}else{\n\t\tres.end("ない");\n\t}\n'
    ];
    return "function(req,res){\n"+_.shuffle(codes)[0]+"}"
  },
  
  // pathのパタンのroutesがあるかどうか
  hasThisRoute: function(path){
    var routes = _.reduce(_.keys(app.routes),function(r,k){
      return r.concat(_.map(app.routes[k], function(o){ return o.path}))
    },[]);
    
    return _.contains(routes,path)
  }
});

module.exports = app;

// rubyの $0 == __FILE__ とおなじ
if(require.main === module){
  app.listen(process.env.PORT || 3000);
}