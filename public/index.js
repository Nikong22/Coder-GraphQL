const socket = io();

socket.on('listar', (productos) => {
    let divTabla = document.getElementById('tabla');
    divTabla.innerHTML = '';
    
    if(productos.length > 0){
        let bodyProductos = '';
        for (producto of productos) {
            bodyProductos += `
            <tr>
                <td>
                    ${producto.id}
                </td>
                <td>
                    ${producto.title}
                </td>
                <td>
                    ${producto.price}
                </td>
                <td>
                    <img src="${producto.thumbnail}" width= "35" alt="url"/>
                </td>
            </tr>
            `
        }

        divTabla.innerHTML = `
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <td>
                        Id
                    </td>
                    <td>
                        Título
                    </td>
                    <td>
                        Precio
                    </td>
                    <td>
                        Url
                    </td>
                </tr>
            </thead>
            <tbody>
                ${bodyProductos}
            </tbody>
        </table>
        `;
    }else{
        divTabla.innerHTML = 'No hay productos';
    }
})

function enviar() {
    socket.emit('notificacion', document.getElementById('title').value, document.getElementById('price').value, document.getElementById('thumbnail').value);
};


socket.on('mensajes', (data, cantAntes, cantNorm) => {
    console.log(data);
    console.log(cantAntes);
    console.log(cantNorm);
    document.getElementById('compresion').innerHTML = `${Math.trunc((1 - (cantNorm / cantAntes)) * 100)} %`;
    render(data);
});

let render = (data) => {
    let html =
        data.map((m) => `
    <div class="fila">
        <strong style="color: blue;">${m.autor}</strong>
        <span style="color: brown;">[${m.fecha}]:</span>
        <em style="color: green;">${m.texto}</em>
    </div>
    `).join(' ');
    document.getElementById('mensajes').innerHTML = html
}

function envioMensaje() {
    if (document.getElementById('email').value == '') {
        alert('email obligatorio');
        return false;
    }
    let email = document.getElementById('email').value;
    let nombre = document.getElementById('nombre').value;
    let apellido = document.getElementById('apellido').value;
    let edad = document.getElementById('edad').value;
    let alias = document.getElementById('alias').value;
    let avatar = document.getElementById('avatar').value;
    
    const autor = {
        email: email,
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        alias: alias,
        avatar: avatar
    }
    let fecha = new Date();
    fecha = fecha.getUTCFullYear() + "-" + (fecha.getUTCMonth() + 1) + "-" + fecha.getUTCDate() + " " + fecha.getUTCHours() + ":" + fecha.getUTCMinutes() + ":" + fecha.getUTCSeconds();
    console.log(fecha);
    let texto = document.getElementById('mensaje').value;
    console.log({autor, fecha, texto});
    socket.emit('nuevo', { autor, fecha, texto });
    return false;
}