import XLSX from 'xlsx';

function socket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected');

    // Cargar Coin
    socket.on('load-coin', ({ file }) => {
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
  const workbook = XLSX.read(file, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const result = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  return result;
}

export default socket;
