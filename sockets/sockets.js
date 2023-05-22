import XLSX from 'xlsx';
import Coin from '../models/coinModel.js';
import Afil from '../models/afilModel.js';
import RaleCop from '../models/raleCOPModel.js';

let raleCOP = new Uint8Array();

function socket(io) {
  io.on('connection', (socket) => {
    // Cargar archivo
    socket.on('client:load-coin', ({ file }) => {
      const result = processFile(file);
      socket.emit('server:result-coin', result);
    });

    socket.on('client:load-afil', ({ file }) => {
      const result = processFile(file);
      socket.emit('server:result-afil', result);
    });

    socket.on('client:load-rale-cop', ({ file }) => {
      const result = processRale(file);
      socket.emit('server:result-rale-cop', result);
    });

    // Registrar COIN en la BD
    socket.on('client:insert-coin', ( coin ) => {
      let coinValidado = [];
      coin.forEach((reg, i) => {
        if(!reg['rp']) {
          alert(`La fila ${i} no tiene registro patronal`)
          return;
        }
        let reg_pat = reg['rp'].substring(0, 3) + '-' + reg['rp'].substring(3, 8) + '-' + reg['rp'].substring(8);
        const regValid = {
          id_coin : null,
          deleg_control : reg['deleg_control'] ? reg['deleg_control'] : "",
          subdeleg_control : reg['subdeleg_control'] ? reg['subdeleg_control'] : "",
          deleg_emi : reg['deleg_emision'] ? reg['deleg_emision'] : "",
          subdeleg_emi : reg['subdeleg_emision'] ? reg['subdeleg_emision'] : "",
          reg_pat,
          escencial : reg['esencial'] ? reg['esencial']  == 'S' : false,
          clasificacion : reg['clasificacion'] ? reg['clasificacion'] : "",
          cve_mov_p : reg['cve_mov_pat'] ? reg['cve_mov_pat'] : "",
          fec_mov : reg['fecha_mov_pat'] ? reg['fecha_mov_pat'] : "",
          razon_social : reg['razon_social'] ? reg['razon_social'] : "",
          num_credito : reg['num_credito'] ? reg['num_credito'] : "",
          periodo : reg['periodo'] ? reg['periodo'] : "",
          importe : reg['importe'] ? reg['importe'] : "",
          tipo_documento : reg['tipo_documento'] ? reg['tipo_documento'] : "",
          seguro : reg['seguro'] ? reg['seguro'] : "",
          dias_estancia : reg['dias_estancia'] ? reg['dias_estancia'] : "",
          incidencia : reg['incidencia'] ? reg['incidencia'] : "",
          fec_incidencia : reg['fecha_incidencia'] ? reg['fecha_incidencia'] : "",
          estado : reg['estado'] ? reg['estado'] == "PROGRAMABLE" : "",
          por_importe : reg['POR IMPORTE'] ? reg['POR IMPORTE'] == "SI" : "",
          por_antiguedad : reg['POR ANTIGUEDAD'] ? reg['POR ANTIGUEDAD'] == "SI" : "",
          inc_actual : reg['INC ACTUAL'] ? reg['INC ACTUAL'] : "",
          resultado : reg['RESULTADO'] ? reg['RESULTADO'] : "",
        };
        coinValidado.push(regValid);
      });

      Coin.bulkCreate(coinValidado)
      .then(() => {
        socket.emit('server:insert-rslt', { msg: 'Archivo COIN insertado correctamente en la Base de Datos', success: true });
      })
      .catch((e) => {
        socket.emit('server:insert-rslt', { msg: `Error: ${e}`, success: false });
      })
    });

    // Registrar AFIL en la BD
    socket.on('client:insert-afil', ( afil ) => {
      let afilValidado = [];
      afil.forEach((reg, i) => {
        const regValid = {
          reg_pat: reg['REG PAT'] ? reg['REG PAT'] : "",
          patron: reg['PATRON'] ? reg['PATRON'] : "",
          actividad: reg['ACTIVIDAD'] ? reg['ACTIVIDAD'] : "",
          domicilio: reg['DOMICILIO'] ? reg['DOMICILIO'] : "",
          localidad: reg['LOCALIDAD'] ? reg['LOCALIDAD'] : "",
          ejecutor: reg['EJECUTOR'] ? reg['EJECUTOR'] : "foraneo",
          clave_eje: reg['CLAVE'] ? reg['CLAVE'] : "E-00000000",
          rfc: reg['RFC'] ? reg['RFC'] : "",
          cp: reg['C.P.'] ? reg['C.P.'] : 0
        };
        afilValidado.push(regValid);
      });

      Afil.bulkCreate(afilValidado)
      .then(() => {
        socket.emit('server:insert-rslt', { msg: 'Archivo AFIL insertado correctamente en la Base de Datos', success: true });
      })
      .catch((e) => {
        socket.emit('server:insert-rslt', { msg: `Error: ${e}`, success: false });
      })
    });

    socket.on('client:insert-rale-cop', async ({ rale, lote }, callback) => {
      try {
        let raleValidado = [];
        let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados
    
        // Recorrer todo el objeto para asignarles los nombres que tienen en la bd
        rale.forEach((reg, i) => {
          // Asignar keys
          const regValid = {
            reg_pat: reg['REG. PATRONAL'],
            mov: reg['M'],
            patronal: reg['OV. PATRONA'],
            sect: reg['L SE'],
            nom_cred: reg['CT NUM.CRED.'],
            ce: reg['C'] ? reg['C'] : "",
            periodo: reg['E  PERIODO'],
            td: reg['TD'],
            fec_alta: reg['FECHA ALTA'],
            fec_notif: reg['FEC. NOTIF'],
            inc: reg['. INC'],
            fec_insid: reg['. FEC. INCID'],
            dias: reg['. DIAS'],
            importe: reg['I M P O R T E'],
            dcsc: reg['DC SC'] ? reg['DC SC'] : 0
          };
          raleValidado.push(regValid);
        });
    
        // Obtener todos los afil registrados y regresar solo el reg pat como afil
        const existingRegPats = await Afil.findAll({
          attributes: ['reg_pat']
        }).then((afilRecords) => {
          return afilRecords.map((afil) => afil.reg_pat);
        });
    
        // Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale 
        const validRecords = await Promise.all(raleValidado.map(async (regValid) => {
          // Obtiene únicamente el reg_pat de ese objeto iterado
          const { reg_pat } = regValid;
    
          // Verificar si el valor de reg_pat ya existe en la tabla afil
          if (!existingRegPats.includes(reg_pat)) {
            registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
            return undefined;
          }
    
          return regValid;
        }));
    
        // Filtrar los registros válidos para insertar en la tabla RaleCop
        const recordsToInsert = validRecords.filter((regValid) => regValid !== undefined);
        
        if (recordsToInsert.length > 0) {
          // console.log('a insertar wachin')
          // Insertar los registros válidos en la tabla RaleCop
          await RaleCop.bulkCreate(recordsToInsert, { logging: false })
          .then(() => {callback(
            { 
              status: true, 
              msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                  registrosNoInsertados.length > 0 
                    ? `Los siguientes registros patronales no están registrados en la tabla afil: ${registrosNoInsertados.join(', ')}` 
                    : "Todos los registros patronales fueron insertador correctamente"
                }
              ` 
            }); 
          //   console.log(`
          //   Lote [${lote}-${lote + 999}] insertado correctamente
          //   ${
          //     registrosNoInsertados.length > 0 
          //       ? `Los siguientes registros patronales no están registrados en la tabla afil: ${registrosNoInsertados.join(', ')}` 
          //       : "Todos los registros patronales fueron insertador correctamente"
          //   }
          // ` )
          }
          )
          .catch((e) => {
            // console.log(`no insertao wachin pk ps: ${e}`)
            callback({ status: false, msg: `No se pudo insertar el lote [${lote}-${lote + 999}]. Error: ${e}` })})
        } else {
          // No hay registros válidos para insertar
          // console.log(`no insertao pk no hay na k insertar`)
          callback({ status: false, msg: `No se pudo insertar el lote [${lote}-${lote + 999}]. No hay registros válidos.` });
        }
      } catch (e) {
        // console.log(`no insertao wachin pk ps: ${e}`)
        callback({ status: false, msg: `No se pudo insertar el lote [${lote}-${lote + 999}]. Error: ${e}` });
      }
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

  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, cellDates: true });
  const headers = data.shift();

  const result = data.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      if (typeof row[index] === 'object' && row[index] instanceof Date) {
        // Convertir la fecha a cadena de texto en el formato deseado
        obj[header] = row[index].toLocaleDateString('es-MX'); // Puedes ajustar el formato según tus necesidades
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });

  return result;
}

function processRale(file) {
  const workbook = XLSX.read(file, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, cellDates: true });

  // Obtener los índices de las columnas de interés
  const headerIndex = {
    'REG. PATRONAL': null,
    'M': null,
    'OV. PATRONA': null,
    'L SE': null,
    'CT NUM.CRED.': null,
    'C': null,
    'E  PERIODO': null,
    'TD': null,
    'FECHA ALTA': null,
    'FEC. NOTIF': null,
    '. INC': null,
    '. FEC. INCID': null,
    '. DIAS': null,
    'I M P O R T E': null,
    'DC SC': null,
  };

  // Buscar los índices de las columnas en el encabezado
  const headers = data[0];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (headerIndex.hasOwnProperty(header)) {
      headerIndex[header] = i;
    }
  }

  // Procesar los datos
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};

    for (const header in headerIndex) {
      const columnIndex = headerIndex[header];
      if (columnIndex !== null && columnIndex < row.length) {
        let value = row[columnIndex];

        // Validar que exista reg_pat
        if (header === 'REG. PATRONAL' && (value === null || value === "" || value === "TOTAL DE")) 
          continue;

        // Poner en nulos los posibles vacíos
        if (header === 'DC SC' || header === 'C' || header === 'FEC. NOTIF' || header === '. FEC. INCID') 
          if (value === null || value === "" || value === "#0/##/####") 
            value = null;

        // Convertir a número entero los que son necesarios
        if (header === 'M' || header === 'L SE' || header === 'TD' || header === '. INC' || header === '. DIAS') 
          value = value !== null ? parseInt(value) : 0;

        // Convertir a número decimal los que son necesarios
        if (header === 'CT NUM.CRED.' || header === 'I M P O R T E') 
          value = value !== null ? parseFloat(value) : 0;

        // Convertir a fecha los que sean necesarios
        if (header === 'OV. PATRONA' || header === 'FECHA ALTA' || header === 'FEC. NOTIF' || header === '. FEC. INCID') 
          value = value !== null ? new Date(value) : null;
        
        // Dar formato al PERIODO
        if (header === 'E  PERIODO') {
          if (value !== null) {
            let fec = value.split('/');
            let fecstr = `${fec[1]}/${fec[0]}/01`;
            value = new Date(Date.parse(fecstr));
          }
        }

        obj[header] = value;
      }
    }
    result.push(obj);
  }
  return result;
}

export default socket;
