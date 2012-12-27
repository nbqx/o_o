var request = require('request');
var _ = require('underscore');

// vmでのcontextをきめるmiddleware login状態とかでcontext変更したりできるかも
function determineContext(req,res,next){

  var cxt = {
    req: req, res: res,
    request: request, _: _
  };

  req.myContext = cxt;
  req.hasContext = function(){
    return (req.myContext!==null)
  };

  next();
};

module.exports = determineContext;