var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var Message = mongoose.model('Message');
var passport = require('passport');
var User = mongoose.model('User');
var Method = mongoose.model('Method');
var MethodGallo = mongoose.model('MethodGallo');
var Campo = mongoose.model('Campo');
// Load widget model
var Widget = mongoose.model('Widget');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET Admin home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'Express' });

});

/* GET message jsons. */
router.get('/chats', function(req, res, next) {
  Chat.find(function(err, chats){
    if(err){ return next(err); }
	
    res.json(chats);
  });
});

router.param('user', function (req, res, next, id) {
    var query = User.findById(id);
    query.exec(function (err, user) {
        if (err) { return next(err); }
        if (!user) { return next(new Error('can\'t find user')); }

        req.user = user;
        return next();
    });
});

/* Methods routes */

router.post('/methods', auth, function(req, res, next) {
  var method = new Method(req.body);
  method.caseInidence10.abrilJunio		   = req.body.caseInidence10.abrilJunio;
  method.caseInidence10.julioSetiembre	   = req.body.caseInidence10.julioSetiembre 
  method.caseInidence10.octubreDiciembre   = req.body.caseInidence10.octubreDiciembre; 
  method.caseInidence1120.abrilJunio	   = req.body.caseInidence1120.abrilJunio;
  method.caseInidence1120.julioSetiembre   = req.body.caseInidence1120.julioSetiembre;
  method.caseInidence1120.octubreDiciembre = req.body.caseInidence1120.octubreDiciembre;
  method.caseInidence2150.abrilJunio       = req.body.caseInidence2150.abrilJunio;
  method.caseInidence2150.julioSetiembre   = req.body.caseInidence2150.julioSetiembre;
  method.caseInidence2150.octubreDiciembre = req.body.caseInidence2150.octubreDiciembre;
  method.caseInidence50.abrilJunio		   = req.body.caseInidence50.abrilJunio;
  method.caseInidence50.julioSetiembre	   = req.body.caseInidence50.julioSetiembre;
  method.caseInidence50.octubreDiciembre   = req.body.caseInidence50.octubreDiciembre;

  method.save(function(err, method){
    if(err){ return next(err); }
	
    res.json(method);
  });
});

router.get('/methods', function(req, res, next) {
  Method.find(function(err, methods){
    if(err){ return next(err); }
	     res.json(methods);
  });
});

router.put('/methods', auth, function(req, res, next) {
	
   var update = req.body;
  Method.findById(req.body._id, function(err, method ) {
  if (!method)
    return next(new Error('Could not load Document'));
  else {
    // do your updates here
      method.caseInidence10.abrilJunio		   = req.body.caseInidence10.abrilJunio;
	  method.caseInidence10.julioSetiembre	   = req.body.caseInidence10.julioSetiembre 
	  method.caseInidence10.octubreDiciembre   = req.body.caseInidence10.octubreDiciembre; 
	  method.caseInidence1120.abrilJunio	   = req.body.caseInidence1120.abrilJunio;
	  method.caseInidence1120.julioSetiembre   = req.body.caseInidence1120.julioSetiembre;
	  method.caseInidence1120.octubreDiciembre = req.body.caseInidence1120.octubreDiciembre;
	  method.caseInidence2150.abrilJunio       = req.body.caseInidence2150.abrilJunio;
	  method.caseInidence2150.julioSetiembre   = req.body.caseInidence2150.julioSetiembre;
	  method.caseInidence2150.octubreDiciembre = req.body.caseInidence2150.octubreDiciembre;
	  method.caseInidence50.abrilJunio		   = req.body.caseInidence50.abrilJunio;
	  method.caseInidence50.julioSetiembre	   = req.body.caseInidence50.julioSetiembre;
	  method.caseInidence50.octubreDiciembre   = req.body.caseInidence50.octubreDiciembre;
	
    method.save(function(err) {
      if (err)
        console.log('error');
      else
      	console.log(method);
        res.json(method);
    });
  }
});
});

/* Methods Gallo routes */

router.post('/methodsGallo', auth, function(req, res, next) {
  var methodGallo = new MethodGallo(req.body);
  methodGallo.caseInidence10.abrilJunio		   = req.body.caseInidence10.abrilJunio;
  methodGallo.caseInidence10.julioSetiembre	   = req.body.caseInidence10.julioSetiembre 
  methodGallo.caseInidence10.octubreDiciembre   = req.body.caseInidence10.octubreDiciembre; 
  methodGallo.caseInidence1120.abrilJunio	   = req.body.caseInidence1120.abrilJunio;
  methodGallo.caseInidence1120.julioSetiembre   = req.body.caseInidence1120.julioSetiembre;
  methodGallo.caseInidence1120.octubreDiciembre = req.body.caseInidence1120.octubreDiciembre;
  methodGallo.caseInidence2150.abrilJunio       = req.body.caseInidence2150.abrilJunio;
  methodGallo.caseInidence2150.julioSetiembre   = req.body.caseInidence2150.julioSetiembre;
  methodGallo.caseInidence2150.octubreDiciembre = req.body.caseInidence2150.octubreDiciembre;
  methodGallo.caseInidence50.abrilJunio		   = req.body.caseInidence50.abrilJunio;
  methodGallo.caseInidence50.julioSetiembre	   = req.body.caseInidence50.julioSetiembre;
  methodGallo.caseInidence50.octubreDiciembre   = req.body.caseInidence50.octubreDiciembre;

  methodGallo.save(function(err, methodGallo){
    if(err){ return next(err); }
	
    res.json(methodGallo);
  });
});

router.get('/methodsGallo', function(req, res, next) {
  MethodGallo.find(function(err, methodsGallo){
    if(err){ return next(err); }
	     res.json(methodsGallo);
  });
});

router.put('/methodsGallo', auth, function(req, res, next) {
	
   var update = req.body;
  MethodGallo.findById(req.body._id, function(err, methodGallo ) {
  if (!methodGallo)
    return next(new Error('Could not load Document'));
  else {
    // do your updates here
      methodGallo.caseInidence10.abrilJunio		   = req.body.caseInidence10.abrilJunio;
	  methodGallo.caseInidence10.julioSetiembre	   = req.body.caseInidence10.julioSetiembre 
	  methodGallo.caseInidence10.octubreDiciembre   = req.body.caseInidence10.octubreDiciembre; 
	  methodGallo.caseInidence1120.abrilJunio	   = req.body.caseInidence1120.abrilJunio;
	  methodGallo.caseInidence1120.julioSetiembre   = req.body.caseInidence1120.julioSetiembre;
	  methodGallo.caseInidence1120.octubreDiciembre = req.body.caseInidence1120.octubreDiciembre;
	  methodGallo.caseInidence2150.abrilJunio       = req.body.caseInidence2150.abrilJunio;
	  methodGallo.caseInidence2150.julioSetiembre   = req.body.caseInidence2150.julioSetiembre;
	  methodGallo.caseInidence2150.octubreDiciembre = req.body.caseInidence2150.octubreDiciembre;
	  methodGallo.caseInidence50.abrilJunio		   = req.body.caseInidence50.abrilJunio;
	  methodGallo.caseInidence50.julioSetiembre	   = req.body.caseInidence50.julioSetiembre;
	  methodGallo.caseInidence50.octubreDiciembre   = req.body.caseInidence50.octubreDiciembre;
	
    methodGallo.save(function(err) {
      if (err)
        console.log('error');
      else
      	console.log(methodGallo);
        res.json(methodGallo);
    });
  }
});
});


/* Campo routes */

router.post('/campo', auth, function(req, res, next) {
  var campo = new Campo(req.body);


  campo.save(function(err, campo){
    if(err){ return next(err); }
     console.log(campo)
    res.json(campo);
  });
});

router.post('/campo/addtests', function(req, res, next) {

  var arr = req.body.plantas

  if(arr.length == 0 ){
        res.json(0);
         
  }
  else{

    

      for (var i = 0, len = arr.length; i < len; i++) {
          
          if ( arr[i].length > 0 && arr[i][0] !== undefined ) {
            if(arr[i][0] != null) {
                var campo = new Campo(arr[i][0]);
                var end = (arr.length - 1)


                campo.save(function(err, campo){
                  if(err){ return next(err); }
                  console.log(end,i)
                });
                 if(end === i) {
                       res.json(1);
                  }
            } /*else {
              res.json(0);
            }*/
              
          } else {
              res.json(0);
          }
      }

       
  }


});

router.get('/campo', function(req, res, next) {
    Campo.find(function(err, methods){
      if(err){ return next(err); }
         res.json(methods);
    });
});


router.get('/campo/:user', function (req, res, next) {
    Campo.find({ 'unidad.user': req.params.user }, function (err, camposUser) {
        if (err) { return next(err); }

        res.json(camposUser);
    });
});

/* Campo routes */

/* Widget Route*/
router.post('/addwidget', function(req, res, next){
    var wid = new Widget(req.body);
    wid.save(function(err, widget){
        if(err){return next(err);}
        res.json(widget);
    });
});
router.delete('/widget/:id', function(req, res)
{
    Widget.findByIdAndRemove(req.params.id, function(err, wid)
    {
        if(err){throw err;}
        Widget.find(function(err, widget){
            if(err){return next(err);}
            res.json(widget);
        });
    });
});
/* End */
router.put('/methods', auth, function(req, res, next) {
  
   var update = req.body;
  Method.findById(req.body._id, function(err, method ) {
  if (!method)
    return next(new Error('Could not load Document'));
  else {
    // do your updates here
      method.caseInidence10.abrilJunio       = req.body.caseInidence10.abrilJunio;
    method.caseInidence10.julioSetiembre     = req.body.caseInidence10.julioSetiembre 
    method.caseInidence10.octubreDiciembre   = req.body.caseInidence10.octubreDiciembre; 
    method.caseInidence1120.abrilJunio     = req.body.caseInidence1120.abrilJunio;
    method.caseInidence1120.julioSetiembre   = req.body.caseInidence1120.julioSetiembre;
    method.caseInidence1120.octubreDiciembre = req.body.caseInidence1120.octubreDiciembre;
    method.caseInidence2150.abrilJunio       = req.body.caseInidence2150.abrilJunio;
    method.caseInidence2150.julioSetiembre   = req.body.caseInidence2150.julioSetiembre;
    method.caseInidence2150.octubreDiciembre = req.body.caseInidence2150.octubreDiciembre;
    method.caseInidence50.abrilJunio       = req.body.caseInidence50.abrilJunio;
    method.caseInidence50.julioSetiembre     = req.body.caseInidence50.julioSetiembre;
    method.caseInidence50.octubreDiciembre   = req.body.caseInidence50.octubreDiciembre;
  
    method.save(function(err) {
      if (err)
        console.log('error');
      else
        console.log(method);
        res.json(method);
    });
  }
});
});

module.exports = router;








