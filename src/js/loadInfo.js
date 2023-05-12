const socket = io('http://localhost:3000');

$('#Coin_input').on('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const file = e.target.result;
            socket.emit('load-coin', file);
        };

        reader.readAsText(archivo);
    }
    else console.log('No se subió un archivo')
})

socket.on('result-coin', (resultado) => {
    console.log(resultado);
    // Haz algo con el resultado recibido del backend
});
