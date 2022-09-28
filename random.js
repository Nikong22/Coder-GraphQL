const random = (cant) => {
    let valores = {}
    
    for (let i = 0; i <= cant; i++) {
        let random = Math.floor(Math.random() * 1000) + 1
        if(valores[random] == undefined){
            valores[random] = 1
        }else{
            valores[random]++;
        }
    }

    console.log(valores)
    return valores
}

process.on("message", (cant)=>{
    process.send(random(cant));
});