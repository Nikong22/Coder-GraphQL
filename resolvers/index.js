const productos = new Map();

let contador = 0;

const obtenerProductos = () => {
  return Array.from(productos.values());
}

const obtenerProductoPorId = (args) => {
  const { id } = args; 
  return productos.get(id);
}

const filtrarProductos = (args) => {
  const { cantidad } = args;
  const todosLosProductos = obtenerProductos();
  return todosLosProductos.filter(producto => producto.cantidad > cantidad);
}

const modificarProducto = (args) => {
  const { id, nombre, cantidad } = args;
  const producto = productos.get(id);
  producto.nombre = nombre;
  producto.cantidad = cantidad;
  producto.set(id, producto);
  return producto;
}

const agregarProducto = (args) => {
  const { nombre, cantidad } = args;
  contador++;
  const id = contador;
  const producto = { id, nombre, cantidad };
  productos.set(id, producto);
  return producto;
}

module.exports = {
  obtenerProductoPorId,
  obtenerProductos,
  modificarProducto,
  agregarProducto,
  filtrarProductos,
}