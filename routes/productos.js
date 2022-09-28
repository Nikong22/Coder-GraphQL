const express = require("express");
const routes_controller = require('./controllers/productos.controller');
const generador = require('../generador/productos');
const routes = require('../router'); 
const passport = require('passport');
const {fork} = require('child_process');

const { Router } = express;

let router = new Router();

router.get("/", (req, res) => {
  res.sendFile("/public/index.html")
});

router.get('/productos', async function (req, res) {
  const productos = await routes_controller.getProductos()
  res.send(productos)
});

router.get("/productos/:id", async (req, res) => {
  const producto = await routes_controller.getProducto(req, res)
  if (!producto){
    res.send("No existe el producto.");
  }else{
    res.send(producto);
  }
});

router.post("/productos", function (req, res) {
  routes_controller.nuevoProducto(req);
  res.redirect("../../../");
});

router.put("/productos/:id", async (req, res) => {
  const update = await routes_controller.actualizarProducto(req);
  if (update)
    res.send("Producto actualizado");
  else
    res.send("No existe el producto.");
});

router.delete("/productos/:id", async (req, res) => {
  const deleted = await routes_controller.borrarProducto(req);
  if (deleted)
    res.send("Producto Borrado");
  else
    res.send("No existe el producto.");
});

//FAKER
router.get('/productos-test', (req,res)=>{
  let productos = [];
  let cant = req.query.cant || 5;
  if (cant == 0) {
    return res.status(404).json({ error: "no hay productos cargados" });
  }
  for (let i=0; i<cant; i++) {
      let producto = generador.get();
      producto.id = i + 1;
      productos.push(producto);
  }
 
  res.send(productos);
});

//process
router.get('/randoms', (req,res) => {
  const cant = req.query.cant ? req.query.cant : 100000000
  console.log(`cantidad: ${cant}`)
  const computo = fork('./random.js');
  computo.send(cant);
  computo.on('message', valores => res.end(mostrarValores(valores)));
});

const mostrarValores = (valores) => {
  let resultado = ''
  for (const valor of Object.entries(valores)) {
    resultado += valor[0] + ': ' + valor[1] + '\n'
  }
  return resultado
}

router.get('/comprobar', (req,res) => {
  res.json('no se bloquea');
});

router.get('/info', (req,res) => {
  const argumentos = []
  process.argv.forEach((val, index) => {
    if(index > 1){
      argumentos.push(val)
    }
  })
  res.json(`argumentos de entrada: ${argumentos} - S.O.: ${process.platform} - Version Node ${process.version} - Uso memoria: ${process.memoryUsage()} - Path: ${process.cwd()} - Process ${process.pid} - Carpeta ${process.cwd()}` )
});

module.exports = router;