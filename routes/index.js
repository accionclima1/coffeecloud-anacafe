var express = require('express');
var router = express.Router();
var speakeasy = require('speakeasy');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';


var Mail = require('../config/mail');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Unit = mongoose.model('Unit');
var Comment = mongoose.model('Comment');
var passport = require('passport');
var User = mongoose.model('User');
var Method = mongoose.model('Method');
var Campo = mongoose.model('Campo');
var Roya = mongoose.model('Roya');
var Gallo = mongoose.model('Gallo');
var Variety = mongoose.model('Variety');
var Vulnerability = mongoose.model('Vulnerability');
var Encuesta = mongoose.model('Encuesta');
// Load widget model
var Widget = mongoose.model('Widget');
var jwt = require('express-jwt');
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });

var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage }).single('userPhoto');

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });

});

/* GET posts page. */
router.get('/posts', function (req, res, next) {
    Post.find(function (err, posts) {
        if (err) { return next(err); }

        res.json(posts);
    });
});

router.post('/posts', auth, function (req, res, next) {
    var post = new Post(req.body);
    post.title = req.body.title;
    post.content = req.body.content;

    post.save(function (err, post) {
        if (err) { return next(err); }
        console.log(post);
        res.json(post);
    });
});

router.post('/upload/photo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

router.put('/posts/:post', auth, function (req, res, next) {
    var update = req.body;
    Post.findById(req.body._id, function (err, post) {
        if (!Post)
            return next(new Error('Could not load Document'));
        else {
            post.title = req.body.title;
            post.content = req.body.content;
            post.save(function (err) {
                if (err)
                    console.log('error');
                else
                    res.json({ message: '¡Noticia Actualizado exitosamente!' });
            });
        }
    });
});


router.param('post', function (req, res, next, id) {
    var query = Post.findById(id);
    query.exec(function (err, post) {
        if (err) { return next(err); }
        if (!post) { return next(new Error('can\'t find post')); }

        req.post = post;
        return next();
    });
});


router.param('comment', function (req, res, next, id) {
    var query = Comment.findById(id);
    query.exec(function (err, comment) {
        if (err) { return next(err); }
        if (!comment) { return next(new Error("Cannot find comment!")); }
        req.comment = comment;
        return next();
    });
});

router.get('/posts/:post', function (req, res, next) {
    req.post.populate('comments', function (err, post) {
        if (err) { return next(err); }

        res.json(post);
    });
});

router.put('/posts/:post/upvote', auth, function (req, res, next) {
    req.post.upvote(function (err, post) {
        if (err) { return next(err); }

        res.json(post);
    });
});

router.post('/posts/:post/comments', auth, function (req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;

    comment.save(function (err, comment) {
        if (err) { return next(err); }

        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) { return next(err); }

            res.json(comment);
        });
    });
});

//comment upvotes
router.put('/posts/:post/comments/:comment/upvote', auth, function (req, res, next) {
    req.comment.upvote(function (err, comment) {
        if (err) { return next(err) }
        res.json(comment);
    });
});

router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: 'Por favor, llene todos los campos' });
    }
    console.log(req.body)
    var user = new User();

    user.username = req.body.username;

    user.email = req.body.email;

    user.phone = req.body.phone;

    user.setPassword(req.body.password);

    user.extemDepartamento = req.body.departamento;

    user.exteMunicipio = req.body.municipio;

    //user.recomendaciontecnica = req.body.recomendaciontecnica;

    user.role = req.body.role;


    user.save(function (err) {
        if (err) { return res.status(500).json({ message: 'Usuario o Correo ya han sido registrados' }) }

        return res.json({ token: user.generateJWT() })
    });
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Por favor, llene todos los campos' });
    }
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }

        if (user) {
            //region changes for giving user Data and not sync units bacl to app while user is loggned successfully.
            var dataList = [];
            var lastSyncDateTime = 0;
            if (req.body.lastSyncDateTime) {
                lastSyncDateTime = req.body.lastSyncDateTime;
            }
            console.log("lastSyncDateTime=" + lastSyncDateTime);
            //getting user units that are not syn in local , do same for other entity
            Unit.find({ LastUpdatedDateTime: { $gt: lastSyncDateTime }, user: user._id }, function (err, units) {
                console.log("inside Unit.find");
                if (!err) {
                    console.log("Length="+units.length);
                    for (var x = 0; x < units.length; x++) {
                        dataList.push(units[x]);
                    }
                    console.log("dataList=" + dataList.length);
                    Variety.find(function (err, varieties) {
                        console.log(varieties);
                        console.log(varieties.length);
                        if (!err) {
                            return res.json({ token: user.generateJWT(), dataList: dataList, varieties: varieties, userData: user });
                        }
                        else {
                            return res.json({ token: user.generateJWT(), dataList: dataList, varieties: [], userData: user });
                        }
                    });
                }
            })
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});
router.post('/requestpasswordchange', function (req, res, next) {
    if (!req.body.Email) {
        return res.status(400).json({ message: 'Proporcione correo electrónico' });
    }

    var query = User.findOne({ "email": req.body.Email });
    query.exec(function (err, user) {
        if (err) { console.log("err in forgot pasword"); return next(err); }
        if (!user) { console.log("user"); /*return next(new Error('can\'t find user'));*/; res.json({ "success": false, data: 0 }); }
        else {
            var secret = speakeasy.generateSecret({ length: 20 });
            var tfa = { secret: secret.base32 };
            var token = speakeasy.totp({
                secret: tfa.secret,
                encoding: 'base32',
                step: 180
            });
            var userIde = (user._id)
            userIde = encrypt(req.body.Email);



            //config.environment().url_domain
            var mailcontent = {
                FROM: '"Coffee Cloud" <centroclimaorg@gmail>', // sender address
                TO: req.body.Email, // list of receivers
                SUBJECT: 'Contraseña Temporal', // Subject line
                HTML: `<p>Hi ${user.username} <p>
                                <p>Aqui esta su contraseña temporal.<br />

                                    OTP: ${token},<br />

                                    Saludos,<br />
                                    Coffee Cloud</p>
                                  ` // html body
            }
            Mail.sendEmail(mailcontent,function(){
res.json({ "success": true, data: { sec: secret.base32, use: userIde } });
            });

            
        }
    });
});

router.post('/changeauthenticate', function (req, res, next) {
    console.log(req.body)
    if (!req.body.otp || !req.body.support) {
        return res.status(400).json({ message: 'Solicitud no válida' });
    }

    var secret = req.body.support.sec
    var tokenValidates = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        step: 180,
        token: req.body.otp
    });

    if (tokenValidates) {
        res.json(1)
    }
    else {
        res.json(0)
    }

});
router.post('/passwordchange', function (req, res, next) {

    if (!req.body.pasword || !req.body.user) {
        return res.status(400).json({ message: 'Solicitud no válida' });
    }
    if (req.body.pasword.password !== req.body.pasword.cpassword) {
        return res.status(401).json({ message: 'La contraseña no coincide' });
    }
    else {

        userIde = decrypt(req.body.user.use);


        var query = User.findOne({ "email": userIde });
        query.exec(function (err, user) {
            if (err) { console.log("err in forgot pasword"); return next(err); }
            if (!user) { console.log("user"); /*return next(new Error('can\'t find user'));*/; res.json({ "success": false, data: 0 }); }
            else {

                user.setPassword(req.body.pasword.password);

                user.save(function (err) {
                    if (err) {
                        console.log('error');
                        res.json({ "success": false, data: 0 });
                    }
                    else
                        res.json({ "success": true, data: 1 });
                });
            }
        })
    }

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

router.param('unit', function (req, res, next, id) {
    var query = Unit.findById(id);
    query.exec(function (err, unit) {
        if (err) { return next(err); }
        if (!unit) { return next(new Error('can\'t find unit')); }

        req.unit = unit;
        return next();
    });
});

router.param('test', function (req, res, next, id) {
    var query = Roya.findById(id);
    query.exec(function (err, test) {
        if (err) { return next(err); }
        if (!test) { return next(new Error('can\'t find test')); }

        req.test = test;
        return next();
    });
});

//ENCUESTA TEST ROUTES!
router.post('/users/:user/encuesta', auth, function (req, res, next) {
    var encuesta =  new Encuesta(req.body);
    encuesta.PouchDBId = req.body.PouchDBId;
    encuesta.LastUpdatedDateTime = req.body.LastUpdatedDateTime;
    encuesta.EntityType = 'Encuesta';
    encuesta.isSync = req.body.isSync;
    encuesta.user = req.user;
    encuesta.isDeleted = req.body.isDeleted;
    encuesta.preguntas = req.body.preguntas;

    encuesta.save(function (err) {
        if (err) { return res.status(500).json({ message: err }); }
        else{
            console.log(encuesta);
            res.json(encuesta);
        }
        
    });

});

router.delete('/encuesta/:test', auth, function (req, res) {
    Encuesta.findByIdAndRemove(req.params.test, function (err, test) {
        if (err) { throw err; }
        res.json({ messageUnit: "Encuesta eliminado!" });
        console.log("Encuesta eliminado!");
    });

});


router.post('/SyncUserLocalData/:user/encuesta', auth, function (req, res, next) {
    
    req.body.forEach(function (item) {
        if (item.EntityType == 'Encuesta') {
            Encuesta.remove({ 'PouchDBId': item.PouchDBId })
            .then(function () {
                console.log("Esto es lo que se sincronizara");
                console.log(req.body);
                console.log("-------");
                var encuesta = new Encuesta();
                encuesta.PouchDBId = item.PouchDBId;
                encuesta.LastUpdatedDateTime = item.LastUpdatedDateTime;
                encuesta.EntityType = 'Encuesta';
                encuesta.isSync = item.isSync;
                encuesta.user = item.user;
                encuesta.isDeleted = item.isDeleted;
                encuesta.preguntas = item.preguntas;

                console.log("------------------");
                for (var i = 0; i < encuesta.preguntas.length; i++) {
                    console.log(encuesta.preguntas[i]);
                }

                console.log("------------------");
                console.log(encuesta.preguntas);                
                console.log("------------------");

                 console.log("------------------");
                console.log(item.preguntas);                
                console.log("------------------");


                console.log("---------- data --------");
                console.log(item);                
                console.log("------------------");

                encuesta.save(function (err) {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }
                });
                
            })
            .catch(function (err) {
                console.log(err);
            });
        }
    });
    return res.json({ Message: "Data encuesta Sync to server successfully" });
});

router.get('/users/:user/encuestas/', function (req, res, next) {
    Encuesta.find(function (err, encuestas) {
        if (err) { return next(err); }

        res.json(encuestas);
    });
});

router.get('/encuestas/:user', function (req, res, next) {
    Encuesta.find({ 'user': req.params.user }, function (err, encuestasUser) {
        if (err) { return next(err); }

        res.json(encuestasUser);
    });
});


router.get('/encuesta', function (req, res, next) {
    Encuesta.find(function (err, encuestas) {
        if (err) { return next(err); }

        res.json(encuestas);
    },function (error){
        console.log("no se pudo");
    });
});





router.post('/users/:user/units', auth, function (req, res, next) {

    var unit = new Unit(req.body);

    //post.author = req.payload.username;
    unit.nombre = req.body.nombre;
    unit.altitud = req.body.altitud;
    unit.departamento = req.body.departamento;
    unit.municipio = req.body.municipio;
    unit.ubicacion = req.body.ubicacion;
    unit.areaTotal = req.body.areaTotal;
    unit.areaCafe = req.body.areaCafe;
    unit.lote = req.body.lote;
    //  unit.edadLote = req.body.edadLote;
    unit.variedad = req.body.variedad;
    unit.distanciamiento = req.body.distanciamiento;
    unit.sombra = req.body.sombra;
    unit.muestreo = req.body.muestreo;
    unit.muestreoMes = req.body.muestreoMes;
    unit.fertilizaSuelo = req.body.fertilizaSuelo;
    unit.fertilizaSueloMes = req.body.fertilizaSueloMes;
    unit.fertilizaFollaje = req.body.fertilizaFollaje;
    unit.fertilizaFollajeMes = req.body.fertilizaFollajeMes;
    unit.enmiendasSuelo = req.body.enmiendasSuelo;
    unit.enmiendasSueloMes = req.body.enmiendasSueloMes;
    unit.manejoTejido = req.body.manejoTejido;
    unit.manejoTejidoMes = req.body.manejoTejidoMes;
    unit.fungicidasRoya = req.body.fungicidasRoya;
    unit.fungicidas = req.body.fungicidas;
    unit.fungicidasFechas = req.body.fungicidasFechas;
    unit.verificaAguaTipo = req.body.verificaAguaTipo;
    unit.verificaAgua = req.body.verificaAgua;
    unit.rendimiento = req.body.rendimiento;
    unit.floracionPrincipal = req.body.floracionPrincipal;
    unit.inicioCosecha = req.body.inicioCosecha;
    unit.finalCosecha = req.body.finalCosecha;
    unit.epocalluviosa = req.body.epocalluviosa;
    unit.FinEpocalluviosa = req.body.FinEpocalluviosa;
    unit.recomendaciontecnica = req.body.recomendaciontecnica;
    unit.tipoCafe = req.body.tipoCafe;
    unit.nitrogeno = req.body.nitrogeno;
    unit.nitrorealiza = req.body.nitrorealiza;
    unit.sacos = req.body.sacos;
    unit.realizapoda = req.body.realizapoda;
    unit.realizamonth = req.body.realizamonth;
    unit.quetipo = req.body.quetipo;
    unit.enfermedades = req.body.enfermedades;
    unit.cyprosol = req.body.cyprosol;
    unit.cyprosoldate = req.body.cyprosoldate;
    unit.atemi = req.body.atemi;
    unit.atemidate = req.body.atemidate;
    unit.esfera = req.body.esfera;
    unit.esferadate = req.body.esferadate;
    unit.opera = req.body.opera
    unit.operadate = req.body.operadate;
    unit.opus = req.body.opus;
    unit.opusdate = req.body.opusdate;
    unit.soprano = req.body.soprano;
    unit.sopranodate = req.body.sopranodate;
    unit.hexalon = req.body.hexalon;
    unit.hexalondate = req.body.hexalondate;
    unit.propicon = req.body.propicon;
    unit.propicondate = req.body.propicondate;
    unit.hexil = req.body.hexil;
    unit.hexildate = req.body.hexildate;
    unit.otros = req.body.otros;
    unit.otrosdate = req.body.otrosdate;
    unit.fungicidasmonth = req.body.fungicidasmonth;
    unit.produccionhectarea = req.body.produccionhectarea;
    unit.typeOfCoffeProducessOptionSelected = req.body.typeOfCoffeProducessOptionSelected;
    unit.isSync = req.body.isSync;
    unit.isDeleted = req.body.isDeleted;
    unit.PouchDBId = req.body.PouchDBId;
    unit.LastUpdatedDateTime = req.body.LastUpdatedDateTime;
    unit.EntityType = 'Unit';
    unit.user = req.user;

    // console.log(req.user);
    unit.save(function (err) {
        if (err) { return res.status(500).json({ message: err }); }
        req.user.units.push(unit);
        req.user.save(function (err, post) {
            if (err) { return next(err); }

            console.log(unit);
            res.json(unit);
        });

    });
});




router.get('/users/:user/units/', function (req, res, next) {
    Unit.find(function (err, units) {
        if (err) { return next(err); }

        res.json(units);
    });
});

router.get('/users/:user/units/:unit', function (req, res) {
    res.json(req.unit);
});

router.put('/users/:user/units/:unit', auth, function (req, res, next) {
    var update = req.body;
    Unit.findById(req.body._id, function (err, unit) {
        if (!unit)
            return next(new Error('Could not load Document'));
        else {
            unit.nombre = req.body.nombre;
            unit.altitud = req.body.altitud;
            unit.departamento = req.body.departamento;
            unit.municipio = req.body.municipio;
            unit.ubicacion = req.body.ubicacion;
            unit.areaTotal = req.body.areaTotal;
            unit.areaCafe = req.body.areaCafe;
            unit.lote = req.body.lote;
            //  unit.edadLote = req.body.edadLote;
            unit.variedad = req.body.variedad;
            unit.distanciamiento = req.body.distanciamiento;
            unit.sombra = req.body.sombra;
            unit.muestreo = req.body.muestreo;
            unit.muestreoMes = req.body.muestreoMes;
            unit.fertilizaSuelo = req.body.fertilizaSuelo;
            unit.fertilizaSueloMes = req.body.fertilizaSueloMes;
            unit.fertilizaFollaje = req.body.fertilizaFollaje;
            unit.fertilizaFollajeMes = req.body.fertilizaFollajeMes;
            unit.enmiendasSuelo = req.body.enmiendasSuelo;
            unit.enmiendasSueloMes = req.body.enmiendasSueloMes;
            unit.manejoTejido = req.body.manejoTejido;
            unit.manejoTejidoMes = req.body.manejoTejidoMes;
            unit.fungicidasRoya = req.body.fungicidasRoya;
            unit.fungicidas = req.body.fungicidas;
            unit.fungicidasFechas = req.body.fungicidasFechas;
            unit.verificaAguaTipo = req.body.verificaAguaTipo;
            unit.verificaAgua = req.body.verificaAgua;
            unit.rendimiento = req.body.rendimiento;
            unit.floracionPrincipal = req.body.floracionPrincipal;
            unit.inicioCosecha = req.body.inicioCosecha;
            unit.finalCosecha = req.body.finalCosecha;
            unit.epocalluviosa = req.body.epocalluviosa;
            unit.FinEpocalluviosa = req.body.FinEpocalluviosa;
            unit.recomendaciontecnica = req.body.recomendaciontecnica;
            unit.tipoCafe = req.body.tipoCafe;
            unit.nitrogeno = req.body.nitrogeno;
            unit.nitrorealiza = req.body.nitrorealiza;
            unit.sacos = req.body.sacos;
            unit.realizapoda = req.body.realizapoda;
            unit.realizamonth = req.body.realizamonth;
            unit.quetipo = req.body.quetipo;
            unit.enfermedades = req.body.enfermedades;
            unit.cyprosol = req.body.cyprosol;
            unit.cyprosoldate = req.body.cyprosoldate;
            unit.atemi = req.body.atemi;
            unit.atemidate = req.body.atemidate;
            unit.esfera = req.body.esfera;
            unit.esferadate = req.body.esferadate;
            unit.opera = req.body.opera
            unit.operadate = req.body.operadate;
            unit.opus = req.body.opus;
            unit.opusdate = req.body.opusdate;
            unit.soprano = req.body.soprano;
            unit.sopranodate = req.body.sopranodate;
            unit.hexalon = req.body.hexalon;
            unit.hexalondate = req.body.hexalondate;
            unit.propicon = req.body.propicon;
            unit.propicondate = req.body.propicondate;
            unit.hexil = req.body.hexil;
            unit.hexildate = req.body.hexildate;
            unit.otros = req.body.otros;
            unit.otrosdate = req.body.otrosdate;
            unit.fungicidasmonth = req.body.fungicidasmonth;
            unit.produccionhectarea = req.body.produccionhectarea;
            unit.typeOfCoffeProducessOptionSelected = req.body.typeOfCoffeProducessOptionSelected;
            unit.isSync = req.body.isSync;
            unit.isDeleted = req.body.isDeleted;
            unit.PouchDBId = req.body.PouchDBId;
            unit.LastUpdatedDateTime = req.body.LastUpdatedDateTime;
            unit.EntityType = 'Unit';
            unit.save(function (err) {
                if (err)
                    console.log('error');
                else
                    console.log(unit);
                res.json(unit);
            });
        }
    });
});

router.delete('/users/:user/units/:unit', auth, function (req, res) {
    Unit.findByIdAndRemove(req.params.unit, function (err, unit) {
        if (err) { throw err; }
        var search_term = req.params.unit;

        for (var i = req.user.units.length - 1; i >= 0; i--) {
            if (req.user.units[i] === search_term) {
                req.user.units.splice(i, 1);
                // break;       //<-- Uncomment  if only the first term has to be removed
            }
        }

        req.user.save(function (err, post) {
            if (err) { return next(err); }

            res.json({ messageUnit: "Unidad eliminada" });

        });
    });

});

router.get('/users', auth, function (req, res, next) {
    User.find(function (err, users) {
        if (err) { return next(err); }

        res.json(users);
    });
});

router.get('/users/:user', function (req, res, next) {
    req.user.populate('units', function (err, user) {
        if (err) { return next(err); }
        //console.log(user);
        res.json(user);
    });
});

router.post('/searchUserUnit', function (req, res, next) {
    var searchObj = req.body;
    console.log(searchObj);
    var whereFilter = {};
    if (searchObj.searchType == "Cedula")
        whereFilter = { "cedula": searchObj.searchValue };
    else
        whereFilter = { "username": searchObj.searchValue };
    //var query = 
    User.findOne(whereFilter).populate('units').exec(function (err, user) {
        console.log(user);
        if (err) { return next(err); }
        else {
            if (user)
                res.json(user);
            else
                res.send({ errorCODE: "USR001" })
        }
    });
    //query.exec(function (err, user) {
    //    //console.log(user);
    //    //res.json(user);

    //    User.populate('units', function (err, user) {
    //        if (err) { return next(err); }
    //        //console.log(user);
    //        res.json(user);
    //    });

    //});
})

router.post('/mailer', function (req, res, next) {
    //req.user.populate('units', function (err, user) {
      //  if (err) { return next(err); }
        //console.log(user);
       // res.json(user);
    //});
    //var mailObj = new Mail();
    //console.log(mailObj);
    console.log(Mail);
    console.log(req.body.mailRequest);
    console.log("here");
    Mail.sendEmail(req.body.mailRequest, function (data) {
        console.log("in promise");
        console.log(data);
        res.json(data);
    });
    
});


router.put('/users/:user', auth, function (req, res, next) {
    var update = req.body;

    User.findById(req.body._id, function (err, user) {
        if (!user)
            return next(new Error('Could not load Document'));
        else {
            // do your updates here
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.role = req.body.role;

            user.cedula = req.body.cedula;

            user.nickname = req.body.nickname;
            //user.recomendaciontecnica = req.body.recomendaciontecnica;
            user.image = req.body.image;



            if (req.body.password) {
                user.setPassword(req.body.password);
            };

            user.save(function (err) {
                if (err)
                    console.log('error');
                else {
                    console.log(err);
                    res.json({ message: '¡Perfil Actualizado exitosamente!' });
                }
            });
        }
    });
});

router.delete('/users/:user', auth, function (req, res) {
    User.findByIdAndRemove(req.params.user, function (err, user) {
        if (err) { throw err; }


        res.json({ messageUnit: "Usuario eliminado!" });
        console.log("Usuario eliminado!");
    });

});

//ROYA TEST ROUTES!
router.post('/roya', auth, function (req, res, next) {
    console.log(req);
    var roya = new Roya(req.body);
    roya.advMode = req.body.advMode;
    roya.bandolas = req.body.bandolas;
    roya.resolved = req.body.resolved;
    roya.user = req.body.user;
    roya.plantas = req.body.plantas;
    roya.unidad = req.body.unidad;
    roya.incidencia = req.body.incidencia;
    roya.inideanciaPromedioPlanta = req.body.avgplnt;
    roya.severidadPromedio = req.body.avgplntDmgPct;
    roya.idunidad = req.body.idunidad;
    roya.loteIndex = req.body.loteIndex;

    roya.save(function (err, roya) {
        if (err) { return next(err); }
        console.log(roya);
        res.json(roya);
    });
});

router.get('/roya', function (req, res, next) {
    Roya.find(function (err, royas) {
        if (err) { return next(err); }

        res.json(royas);
    },function (error){
        console.log("no se pudo");
    });
});

router.get('/roya/:user', function (req, res, next) {
    Roya.find({ 'unidad.user': req.params.user }, function (err, royasUser) {
        if (err) { return next(err); }

        res.json(royasUser);
    });
});


router.post('/gallo', auth, function (req, res, next) {

    var gallo = new Gallo(req.body);
    gallo.advMode = req.body.advMode;
    gallo.bandolas = req.body.bandolas;
    gallo.resolved = req.body.resolved;
    gallo.user = req.body.user;
    gallo.plantas = req.body.plantas;
    gallo.unidad = req.body.unidad;
    gallo.incidencia = req.body.incidencia;
    gallo.inideanciaPromedioPlanta = req.body.avgplnt;
    gallo.severidadPromedio = req.body.avgplntDmgPct;

    gallo.save(function (err, gallo) {
        if (err) { return next(err); }

        res.json(gallo);
    });
});

router.get('/gallo', function (req, res, next) {
    Gallo.find(function (err, gallo) {
        if (err) { return next(err); }

        res.json(gallo);
    });
});

router.delete('/roya/:test', auth, function (req, res) {
    Roya.findByIdAndRemove(req.params.test, function (err, test) {
        if (err) { throw err; }
        res.json({ messageUnit: "Test eliminado!" });
        console.log("Test eliminado!");
    });

});

router.get('/technico/units', function (req, res, next) {

    Unit.find(function (err, units) {
        if (err) { return next(err); }

        res.json(units);
    });
});

/* Route for widget */
router.get('/getWidgets', function (req, res, next) {
    Widget.find(function (err, widget) {
        if (err) { return next(err); }
        res.json(widget);
    });
});
/* End */


/*API for Sync */

///*Get all Users for writing to pouch db*/
//router.get('/getUserNotSyncUnits/:user/units/', function(req, res, next) {
//  Unit.find( { isSync: false },function(err,units){
//        if(err){ return next(err); }
//            res.json(units);
//  });

//});

//router.post('/SyncUserUnits/:user/units', auth, function(req, res, next) {
//    Unit.remove({ 'PouchDBId' : req.body.PouchDBId }, function (err) {
//    })
//     var unit = new Unit(req.body);
//  	 unit.nombre = req.body.nombre;
//     unit.altitud = req.body.altitud; 
//     unit.departamento = req.body.departamento;
//	   unit.municipio = req.body.municipio;
//     unit.ubicacion = req.body.ubicacion;
//     unit.areaTotal = req.body.areaTotal;
//     unit.areaCafe = req.body.areaCafe ;
//     unit.lote = req.body.lote;
//     unit.variedad = req.body.variedad;
//     unit.distanciamiento = req.body.distanciamiento;
//     unit.sombra = req.body.sombra;
//     unit.muestreo = req.body.muestreo;
//     unit.muestreoMes = req.body.muestreoMes;
//     unit.fertilizaSuelo = req.body.fertilizaSuelo;
//     unit.fertilizaSueloMes = req.body.fertilizaSueloMes;
//     unit.fertilizaFollaje = req.body.fertilizaFollaje;
//     unit.fertilizaFollajeMes = req.body.fertilizaFollajeMes;
//     unit.enmiendasSuelo = req.body.enmiendasSuelo;
//     unit.enmiendasSueloMes = req.body.enmiendasSueloMes;
//     unit.manejoTejido = req.body.manejoTejido;
//     unit.manejoTejidoMes = req.body.manejoTejidoMes;
//     unit.fungicidasRoya = req.body.fungicidasRoya;
//     unit.fungicidas = req.body.fungicidas;
//     unit.fungicidasFechas = req.body.fungicidasFechas;
//     unit.verificaAguaTipo = req.body.verificaAguaTipo ;
//     unit.verificaAgua = req.body.verificaAgua ;
//     unit.rendimiento = req.body.rendimiento;
//     unit.floracionPrincipal = req.body.floracionPrincipal;
//     unit.inicioCosecha = req.body.inicioCosecha;
//     unit.finalCosecha = req.body.finalCosecha;
//     unit.epocalluviosa = req.body.epocalluviosa;
//     unit.FinEpocalluviosa = req.body.FinEpocalluviosa;
//     unit.recomendaciontecnica = req.body.recomendaciontecnica;
//     unit.tipoCafe = req.body.tipoCafe;
//      unit.nitrogeno = req.body.nitrogeno ;
//      unit.nitrorealiza= req.body.nitrorealiza ;
//      unit.sacos= req.body.sacos ;
//      unit.realizapoda= req.body.realizapoda ;
//      unit.realizamonth= req.body.realizamonth ;
//      unit.quetipo= req.body.quetipo ;
//      unit.enfermedades= req.body.enfermedades ;
//      unit.cyprosol= req.body.cyprosol ;
//      unit.cyprosoldate= req.body.cyprosoldate ;
//      unit.atemi= req.body.atemi ;
//      unit.atemidate= req.body.atemidate ;
//      unit.esfera= req.body.esfera ;
//      unit.esferadate= req.body.esferadate;
//      unit.opera= req.body.opera
//      unit.operadate= req.body.operadate ;
//      unit.opus= req.body.opus ;
//      unit.opusdate= req.body.opusdate ;
//      unit.soprano= req.body.soprano ;
//      unit.sopranodate= req.body.sopranodate ;
//      unit.hexalon= req.body.hexalon ;
//      unit.hexalondate= req.body.hexalondate ;
//      unit.propicon= req.body.propicon ;
//      unit.propicondate= req.body.propicondate ;  
//      unit.hexil= req.body.hexil ;
//      unit.hexildate= req.body.hexildate ;   
//      unit.otros= req.body.otros ;
//      unit.otrosdate= req.body.otrosdate ;
//      unit.fungicidasmonth= req.body.fungicidasmonth ;
//      unit.produccionhectarea= req.body.produccionhectarea ;
//      unit.typeOfCoffeProducessOptionSelected= req.body.typeOfCoffeProducessOptionSelected ;
//      unit.isSync= req.body.isSync ;
//      unit.isDeleted= req.body.isDeleted ;
//      unit.PouchDBId= req.body.PouchDBId ;

//      unit.user = req.user;

//      // console.log(req.user);
//      unit.save(function(err){
//        if(err){ return res.status(500).json({message: err}); }
//        req.user.units.push(unit);
//        req.user.save(function(err, post) {
//          if(err){ return next(err); }
//                console.log(unit);
//           res.json(unit);
//        });  
//	  });
//});



router.post('/SyncUserServerData/:user/:lastSyncDateTime', function (req, res, next) {
    var dataList = [];
    var lastSyncDateTime = 0;
    if (req.lastSyncDateTime) {
        lastSyncDateTime = req.lastSyncDateTime;
    }
    Unit.find({ LastUpdatedDateTime: { $gt: lastSyncDateTime }, user: req.user }, function (err, units) {
        if (!err) {
            for (var x = 0; x < units.length; x++) {
                dataList.push(units[x]);
            }
            Variety.find(function (err, varieties) {
                if (!err) {
                    return res.json({ dataList: dataList, varieties: varieties });
                }
                else {
                    return res.json({ dataList: dataList});
                }
            });
           
        }
    });
});

router.post('/SyncUserLocalData/:user/datalist', auth, function (req, res, next) {
    
    req.body.forEach(function (item) {
        if (item.EntityType == 'Unit') {
            Unit.remove({ 'PouchDBId': item.PouchDBId })
            .then(function () {
                var unit = new Unit();
                unit.nombre = item.nombre;
                unit.altitud = item.altitud;
                unit.departamento = item.departamento;
                unit.municipio = item.municipio;
                unit.ubicacion = item.ubicacion;
                unit.areaTotal = item.areaTotal;
                unit.areaCafe = item.areaCafe;
                unit.lote = item.lote;
                unit.variedad = item.variedad;
                unit.distanciamiento = item.distanciamiento;
                unit.sombra = item.sombra;
                unit.muestreo = item.muestreo;
                unit.muestreoMes = item.muestreoMes;
                unit.fertilizaSuelo = item.fertilizaSuelo;
                unit.fertilizaSueloMes = item.fertilizaSueloMes;
                unit.fertilizaFollaje = item.fertilizaFollaje;
                unit.fertilizaFollajeMes = item.fertilizaFollajeMes;
                unit.enmiendasSuelo = item.enmiendasSuelo;
                unit.enmiendasSueloMes = item.enmiendasSueloMes;
                unit.manejoTejido = item.manejoTejido;
                unit.manejoTejidoMes = item.manejoTejidoMes;
                unit.fungicidasRoya = item.fungicidasRoya;
                unit.fungicidas = item.fungicidas;
                unit.fungicidasFechas = item.fungicidasFechas;
                unit.verificaAguaTipo = item.verificaAguaTipo;
                unit.verificaAgua = item.verificaAgua;
                unit.rendimiento = item.rendimiento;
                unit.floracionPrincipal = item.floracionPrincipal;
                unit.inicioCosecha = item.inicioCosecha;
                unit.finalCosecha = item.finalCosecha;
                unit.epocalluviosa = item.epocalluviosa;
                unit.FinEpocalluviosa = item.FinEpocalluviosa;
                unit.recomendaciontecnica = item.recomendaciontecnica;
                unit.tipoCafe = item.tipoCafe;
                unit.nitrogeno = item.nitrogeno;
                unit.nitrorealiza = item.nitrorealiza;
                unit.sacos = item.sacos;
                unit.realizapoda = item.realizapoda;
                unit.realizamonth = item.realizamonth;
                unit.quetipo = item.quetipo;
                unit.enfermedades = item.enfermedades;
                unit.cyprosol = item.cyprosol;
                unit.cyprosoldate = item.cyprosoldate;
                unit.atemi = item.atemi;
                unit.atemidate = item.atemidate;
                unit.esfera = item.esfera;
                unit.esferadate = item.esferadate;
                unit.opera = item.opera
                unit.operadate = item.operadate;
                unit.opus = item.opus;
                unit.opusdate = item.opusdate;
                unit.soprano = item.soprano;
                unit.sopranodate = item.sopranodate;
                unit.hexalon = item.hexalon;
                unit.hexalondate = item.hexalondate;
                unit.propicon = item.propicon;
                unit.propicondate = item.propicondate;
                unit.hexil = item.hexil;
                unit.hexildate = item.hexildate;
                unit.otros = item.otros;
                unit.otrosdate = item.otrosdate;
                unit.fungicidasmonth = item.fungicidasmonth;
                unit.produccionhectarea = item.produccionhectarea;
                unit.typeOfCoffeProducessOptionSelected = item.typeOfCoffeProducessOptionSelected;
                unit.isSync = item.isSync;
                unit.isDeleted = item.isDeleted;
                unit.PouchDBId = item.PouchDBId;
                unit.LastUpdatedDateTime = item.LastUpdatedDateTime;
                unit.EntityType = 'Unit';
                unit.user = req.user;

                unit.save(function (err) {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }
                    req.user.units.push(unit);
                    req.user.save(function (err, post) {
                        if (err) {
                            return next(err);
                        }
                    });
                });
                
            })
            .catch(function (err) {
                console.log(err);
            });
        }
    });
    return res.json({ Message: "Data Sync to server successfully" });
});


router.post('/varieties', auth, function (req, res, next) {


    var varieties = new Variety(req.body);

    //post.author = req.payload.username;
    varieties.name = req.body.name;

    // console.log(req.user);
    varieties.save(function (err) {
        console.log("aqui se entra...........................");
        if (err) { return res.status(500).json({ message: err }); }
        res.json(varieties);

    });
});


router.post('/varieties/update', auth, function (req, res, next) {
    console.log(req.body);
    Variety.findById(req.body._id, function (err, varie) {
        console.log(varie);
        varie.name = req.body.name;
        varie.save(function (err, updatedvarie) {
            if (err) return res.send({Success:false});
            res.send({ Success: true });
        });
    });
});


router.get('/varieties', function (req, res, next) {
    Variety.find(function (err, varieties) {
        if (err) { return next(err); }

        res.json(varieties);
    });
});


router.delete('/varieties', auth, function (req, res) {
    Variety.findByIdAndRemove(req.headers.variid, function (err, varie) {
        if (err) { console.log(err); /*throw err;*/ }
        res.json({ messageUnit: "variedad eliminada!" });
    });

});


/* */
module.exports = router;

















