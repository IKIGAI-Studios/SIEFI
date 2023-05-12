import XLSX from 'xlsx';

function socket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected');

    // Cargar Coin
    socket.on('load-coin', (file) => {
      const result = processFile(file);

      // Envía el resultado al cliente
      socket.emit('result-coin', result);
    });

    // Maneja el evento de desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

function processFile(file) {
    // Procesa el archivo utilizando la biblioteca XLSX
    const workbook = XLSX.read(file, { type: 'binary' });
    // Realiza las operaciones necesarias con el archivo y obtén el resultado deseado
    console.log(workbook);
    // Devuelve el resultado
    return result;
}

export default socket;
