import XLSX from 'xlsx';
import Coin from '../models/coinModel.js';
import Afil from '../models/afilModel.js';
import RaleCop from '../models/raleCOPModel.js';
import {Op} from 'sequelize';

function socket(io) {
  io.on('connection', (socket) => {
    // Cargar archivo
    socket.on('load-coin', ({ file }) => {
      const result = processFile(file);
      socket.emit('result-coin', result);
    });

    socket.on('load-afil', ({ file }) => {
      const result = processFile(file);
      socket.emit('result-afil', result);
    });

    socket.on('load-rale-cop', ({ file }) => {
      const result = processFile(file);
      socket.emit('result-rale-cop', result);
    });

    socket.on('cliente:consultarPatronesAsignados', async (clave_eje) => {
      const pAsignados = await Afil.findAll({
        where: {clave_eje : clave_eje}
       });
      socket.emit('servidor:patronesAsignados', pAsignados);
    });

    socket.on('cliente:consultarPatronesNoAsignados', async (clave_eje) => {
      const pNoAsignados = await Afil.findAll({
        where: {
          clave_eje: { [Op.not]: clave_eje }
        }
       });
      socket.emit('servidor:patronesNoAsignados', pNoAsignados);
    });

    // Registrar COIN en la BD
    socket.on('insert-coin', ( coin ) => {
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
        socket.emit('insert-rslt', { msg: 'Archivo COIN insertado correctamente en la Base de Datos', success: true });
        console.log("Insertado BN")
      })
      .catch((e) => {
        socket.emit('insert-rslt', { msg: `Error: ${e}`, success: false });
        console.log(`Insertado Mal: ${e}`)
      })
    });

    // Registrar AFIL en la BD
    socket.on('insert-afil', ( afil ) => {
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
        socket.emit('insert-rslt', { msg: 'Archivo AFIL insertado correctamente en la Base de Datos', success: true });
        console.log("Insertado BN")
      })
      .catch((e) => {
        socket.emit('insert-rslt', { msg: `Error: ${e}`, success: false });
        console.log(`Insertado Mal: ${e}`) 
      })
    });

    socket.on('insert-rale-cop', ( rale ) => {
      let raleValidado = [];
      rale.forEach((reg, i) => {
        if (!reg['REG. PATRONAL']) {
          alert(`La fila ${i} no tiene registro patronal`)
          return;
        }
        const regValid = {
          reg_pat,
          mov : reg['M'] ? reg['M'] : "",
          patronal : reg['OV. PATRONA'] ? reg['OV. PATRONA'] : "",
          sect : reg['L SE'] ? reg['L SE'] : "",
          nom_cred : reg['CT NUM.CRED.'] ? reg['CT NUM.CRED.']  == 'S' : false,
          ce : reg['C'] ? reg['C'] : "",
          periodo : reg['E  PERIODO'] ? reg['E  PERIODO'] : "",
          td : reg['TD'] ? reg['TD'] : "",
          fec_alta : reg['FECHA ALTA'] ? reg['FECHA ALTA'] : "",
          fec_notif : reg['FEC. NOTIF'] ? reg['FEC. NOTIF'] : "",
          inc : reg['. INC'] ? reg['. INC'] : "",
          fec_insid : reg['. FEC. INCID'] ? reg['. FEC. INCID'] : "",
          dias : reg['. DIAS'] ? reg['. DIAS'] : "",
          importe : reg['I M P O R T E'] ? reg['I M P O R T E'] : "",
          dcsc : reg['DC SC'] ? reg['DC SC'] : ""
        };
        raleValidado.push(regValid);
      });

      // RaleCop.bulkCreate(raleValidado)
      // .then(() => {
      //   socket.emit('insert-rslt', { msg: 'Archivo COIN insertado correctamente en la Base de Datos', success: true });
      //   console.log("Insertado BN")
      // })
      // .catch((e) => {
      //   socket.emit('insert-rslt', { msg: `Error: ${e}`, success: false });
      //   console.log(`Insertado Mal: ${e}`)
      // })
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

  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const headers = data.shift();

  const result = data.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return result;
}

export default socket;
