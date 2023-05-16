import XLSX from 'xlsx';
import Coin from '../models/coinModel.js';

function socket(io) {
  io.on('connection', (socket) => {
    // Cargar archivo
    socket.on('load-file', ({ file, type }) => {
      const result = processFile(file);
      
      switch (type) {
        // Envía el resultado al cliente COIN
        case 'coin':
          socket.emit('result-coin', result);
          break;
      
        default:
          bsAlert(`No has seleccionado ningun archivo COIN`, 'danger');
          break;
      }
    });

    // Registrar COIN en la BD
    socket.on('insert-coin', ( coin ) => {
      console.log(coin)
      coin.forEach((reg, i) => {
        if (i == 0) return;
        if (i == 2) {
          const regValid = [
            reg[0],
            reg[1],
            reg[2],
            reg[3],
            reg[4],
            reg[5] == 'S',
            reg[6],
            reg[7],
            reg[8],
            reg[9],
            reg[10],
            reg[11],
            reg[12],
            reg[13],
            reg[14],
            reg[15],
            reg[16],
            reg[17],
            reg[18] == "PROGRAMABLE",
            reg[19] == "SI",
            reg[20] == "SI",
            reg[21]? reg[21] : "",
            reg[22]? reg[22] : "",
          ]
          console.log(regValid);
        }
      })
    });

    // Maneja el evento de desconexión del cliente
    socket.on('disconnect', () => {
      // Programar eventos (innecesarios por ahora)
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
