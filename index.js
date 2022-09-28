const express = require("express");
const util = require('util');
const routes = require("./routes/productos")
const rutas = require('./router');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const { normalize, schema } = require('normalizr');
const MensajeDB = require('./models/mensajes')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const routes_controller = require('./routes/controllers/productos.controller');
const {obtenerUsuario, obtenerUsuarioId, passwordValida} = require('./utils/util');
const bCrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = require('./router'); 
const User = require('./models/users')
require('dotenv').config({ path: __dirname + '/.env' })
const {fork} = require('child_process');
const cluster = require('cluster');
const fs = require('fs'); 
const logger = require('./logger');
var fileupload = require("express-fileupload");
const compression = require('compression')
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
const { obtenerProductoPorId, obtenerProductos, modificarProducto, filtrarProductos, agregarProducto } = require('./resolvers');

const PORT = process.env.PORT;
const http = require("http").Server(app);
const io = require('socket.io')(http);
const schemaString = fs.readFileSync('./schemas/productos.gql').toString();
const schemaCompilado = buildSchema(schemaString);

const graphMiddleware = graphqlHTTP({
  schema: schemaCompilado,
  rootValue: {
    obtenerProductoPorId: obtenerProductoPorId,
    obtenerProductos: obtenerProductos,
    modificarProducto: modificarProducto,
    filtrarProductosPorCantidad: filtrarProductos,
    agregarProducto: agregarProducto,
  },
  graphiql: true
});

const app = express();
app.use('/graphql', graphMiddleware);

app.use(fileupload());
let FORK_O_CLUSTER = 'FORK'

const numCPUs = require('os').cpus().length
if(FORK_O_CLUSTER == 'FORK'){
  app.listen(PORT, () => logger.info(`Servidor HTTP escuando en el puerto ${PORT}`));
}else{
  if(cluster.isMaster){
    console.log(`master ${process.pid} running`)
    for(let i = 0; i < numCPUs; i++){
      cluster.fork()
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })
  }else{
    console.log(`worker ${process.pid} started`)
    app.listen(PORT, () => logger.info(`Servidor HTTP escuando en el puerto ${PORT}`));
  }
}
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes)
const cookieParser = require('cookie-parser');
app.use(cookieParser("clave-secreta"));
app.use(compression())

app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false,
  // cookie: { maxAge: 5000 }
}));
app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas
app.use(passport.initialize());
app.use(passport.session());

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials"
  })
);

app.use('/', (req, res, next) => {
  if (req.cookies.username) {
    const username = req.cookies.username
    res.cookie('username', username, { signed: false, maxAge: 5000 });
  }
  express.static('public')(req, res, next);
});

function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true))
}

io.on('connection', async (socket) => {
  console.log('alguien se está conectado...');

  const productos = await routes_controller.getProductos()
  let mensajes = await MensajeDB.find({}).then((mensajes) => {
    return mensajes
  })

  const chat= {
    id: 123,
    mensajes: mensajes
  };

  io.sockets.emit('listar', productos);

  socket.on('notificacion', (title, price, thumbnail) => {
    const producto = {
      title: title,
      price: price,
      thumbnail: thumbnail,
    };
    producto.push(productos);
    console.log(producto)

    io.sockets.emit('listar', productos)
  })

  console.log('normalizr:')
  console.log(mensajes)

  const mensajeSchema = new schema.Entity('mensajes');

  const chatSchema = new schema.Entity('chat', {
    mensajes: [mensajeSchema]
  });

  const normalizedChat = normalize(chat, chatSchema);

  // print(normalizedChat);
  console.log('Longitud antes de normalizar:', JSON.stringify(chat).length);
  console.log('Longitud después de normalizar:', JSON.stringify(normalizedChat).length);
  io.sockets.emit('mensajes', mensajes, JSON.stringify(chat).length, JSON.stringify(normalizedChat).length);

  socket.on('nuevo', (data) => {
    MensajeDB.insertMany([data])
      .then((id_insertado) => {
        mensajes['id'] = id_insertado[0];
        mensajes.push(data);
        console.log('Longitud antes de normalizar:', JSON.stringify(chat).length);
        console.log('Longitud después de normalizar:', JSON.stringify(normalizedChat).length);
        io.sockets.emit('mensajes', mensajes, JSON.stringify(chat).length, JSON.stringify(normalizedChat).length);
        console.log(`Mensajes grabados...`);

      });
  })

});

//passport
//LOGIN (COOKIE)


app.get('/logout', (req,res)=>{
  const username = req.cookies.username
  res.clearCookie('username');
  res.render('logout', { username: username });
  req.session.destroy(err=>{
    if (err){
        res.json({status: 'Logout error', body: err});
    } else {
        res.send('Logout ok!');
    }
  });
});

app.post('/doLogin', (req,res)=>{
  const username = req.body.usuario
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  res.cookie('username', username,  { signed: false, maxAge: 5000 } );
  res.redirect('/');
});


//ARREGLAR EL logout**
//PASSPORT
app.get('/test', (req,res)=>{
  res.send('Server levantado...');
});

app.get('/login', rutas.getLogin);
app.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}), rutas.postLogin);
app.get('/faillogin', rutas.getFailLogin);

app.get('/signup', rutas.getSignUp);
app.post('/signup', passport.authenticate('signup', {failureRedirect: '/failsignup'}), rutas.postSignUp);
app.get('/failsignup', rutas.getFailSignUp);

app.get('/logout', rutas.getLogout);

app.get('/ruta-protegida', checkAuthentication, rutas.getRutaProtegida);

app.get('/datos', rutas.getDatos);

app.get('*', rutas.failRoute);

function checkAuthentication(req, res, next){
  if (req.isAuthenticated()){
      next();
  } else {
      res.redirect('/');
  }
}

passport.use('login', new LocalStrategy({
  passReqToCallback: true
},
  function(req, username, password, done){
    User.findOne({ 'username' : username },
      function (err, user){
        if (err)
          return done(err);
        if (!user){
          console.log('user not found ' +username);
          return done(null, false,
            console.log('message', 'user not found'));
          }
        if(!isValidPassword(user, password)){
          console.log('Invalid password');
          return done (null, false,
            console.log('mensage', 'Invalid Password'));
          }
        return done (null, user);
      }
     );
    })
  );

  const isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }
  
passport.use('signup', new LocalStrategy({
    passReqToCallback: true
  },
  function (req, username, password, done){
    findOrCreateUser = function(){
      User.findOne({'username' : username}, function(err, user) {
        if (err){
          console.log('Error en SignUp: ' +err);
          return done(err);
        }
        if (user) {
          console.log('User already exists');
          return done (null, false,
            console.log('message', 'User Already Exists'));
        } else {
          var newUser = new User();
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.firstName = req.body.firstName;
          newUser.lastName = req.body.lastName;
          newUser.age = req.body.age;
          newUser.save(function(err){
            if (err){
              console.log('Error in Saving user: '+err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    }
    process.nextTick(findOrCreateUser);
  })
)
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
  

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
  
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    done(err, user);
  });
});