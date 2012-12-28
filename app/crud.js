var vm = require('vm');
var _ = require('underscore');
var Code = require('./models/db').Code;
var determineContext = require('./middles/determineContext');

module.exports = function(app){

  // call script in mongodb
   app.get('/do/:id', determineContext, function(req,res){
    var id = req.params.id;

    res.on('data', function(data){
      var code_id = data.get("_id");
      var src = data.body;

      if(src!==''){
        var code = (_.template("'use strict';(<%= src %>)(req, res)"))({src: src});
        var cxt = {req: req, res: res};
    
        if(req.hasContext()) cxt = req.myContext;
    
        try{
          var proc = vm.createScript(code);
          proc.runInNewContext(cxt);
        }catch(e){
          req.flash('error',''+e);
          req.flash('script',src);
          res.redirect('/r/'+code_id);
        }
        process.send('done');
      }else{
        res.redirect('/');
      }

    });

    Code.findById(id,function(err,doc){
      if(err){
        req.flash('error','something wrong');
      }
      res.emit('data',doc);
    });

  });

  // save with xhr
  app.post('/xhr/save', function(req,res){
    res.on('end',function(data){
      var json = JSON.stringify(data);
      this.send(json);
    });

    if(req.xhr){
      var d = req.body;
      var fnname = d.name;
      var body = d.code;
      
      var code = new Code();
      code.name = fnname;
      code.body = body;

      code.save(function(err,doc){
        if(err) console.log(err);
        var id = doc.get("_id");
        res.emit('end', {success:true, message: 'ok', id: id});
      });
      
    }else{
      res.redirect('/');
    }
    
  });

  // update with xhr
  app.post('/xhr/update', function(req,res){
    var d = req.body;
    var id = d.id;
    var fnname = d.name;
    var body = d.code;

    res.on('xhr',function(data){
      var json = JSON.stringify(data);
      this.send(json);
    });

    if(req.xhr){
      if(body!==''){
        Code.findOneAndUpdate({_id: id}, {name: fnname, body: body}, function(err,doc){
          if(err) console.log(err);
          res.emit('xhr', {success:true, message: 'update', id: id});
        });
      }else{
        Code.findOneAndRemove({_id: id}, function(err){
          if(err) console.log(err);
          res.emit('xhr', {success:true, message: 'delete', id: id});
        });
      }
      
    }else{
      res.redirect('/');
    }
  });

  // create
  app.post('/c',function(req,res){
    var d = req.body;
    var fnname = d.fnname;
    var body = d.code;
      
    var code = new Code();
    code.name = fnname;
    code.body = body;

    code.save(function(err,doc){
      if(err) console.log(err);
      var id = doc.get("_id");
      req.flash('info','id: '+id+' is created');
      res.redirect('/r/'+id);
    });
  });

  // read
  app.get('/r', function(req,res){
    Code.findOne({}, 'name body', function(err,doc){
      if(doc){
        res.render('edit',{id: doc.id, fnname: doc.name, script: doc.body, error: null, info: null});
      }
      else{
        req.flash("error","no data found");
        res.redirect("/");
      }
    });
  });

  // read with `id` param
  app.get('/r/:id',function(req,res){
    var id = req.params.id;
    Code.findOne({_id: id}, null, function(err,doc){
      if(doc){
        res.render('edit',{id: doc.id, fnname: doc.name, script: doc.body, error: ''+req.flash('error'), info: ''+req.flash('info')});
      }
      else{
        req.flash("error","id: "+id+" not found or deleted");
        res.redirect("/");
      }
    });
  });

  // findAll
  app.get('/all', function(req,res){
    
    res.on('data',function(data){
      var ret = [];
      data.forEach(function(o,i){
        ret.push({
          id: o.get("_id"),
          name: o.get("name"),
          script: o.get("body")
        });
      });

      var data = _.groupBy(ret, function(o,idx){
        return Math.floor(idx/3);
      });
      res.render('all', {data: data, error: req.flash('error'), info: req.flash('info')});
    });

    Code.find({}, function(err,docs){
      res.emit('data',docs);
    });

  });
};

