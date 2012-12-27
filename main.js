var cluster = require('cluster');
var TIMEOUT = 5000;

if(cluster.isMaster){
  function serve(){
    var timer;
    cluster.on('online', function(worker){
      worker.on('message', function(msg){
        if(msg==='start'){
          timer = setTimeout(function(){
            worker.destroy();
          }, TIMEOUT);
        }
        else if(msg==='done'){
          clearTimeout(timer);
        }
      });
    });
    cluster.fork();
  };

  cluster.on('exit', function(){ serve() });
  serve();
}
else{
  var app = require("./app");
  app.listen(process.env.PORT || 3000);
}

