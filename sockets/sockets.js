import XLSX from "xlsx";
import Coin from "../models/coinModel.js";
import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";

function socket(io) {
  io.on("connection", (socket) => {
    // Cargar archivo
    socket.on("client:load-coin", ({ file }) => {
      const result = processCoin(file);
      socket.emit("server:result-coin", result);
    });

    socket.on("client:load-afil", ({ file }) => {
      console.log(file)
      const result = processAfil(file);
      socket.emit("server:result-afil", result);
    });

    socket.on("client:load-rale", ({ file }, callback) => {
      const { result, raleType } = processRale(file);
      if (raleType == "COP")
        socket.emit("server:result-rale-cop", result);
      else if (raleType == "RCV")
        socket.emit("server:result-rale-rcv", result);
      else if (raleType == "")
        callback({
          status: false,
          msg: `Seleccione un archivo RALE valido`,
        });
    });

    // ! INSERT COIN
    socket.on("client:insert-coin", async ({ coin, lote }, callback) => {
      try {
        let coinValidado = [];
        let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

        coin.forEach((reg, i) => {
          const regValid = {
            id_coin: null,
            deleg_control: reg["deleg_control"],
            subdeleg_control: reg["subdeleg_control"],
            deleg_emi: reg["deleg_emision"],
            subdeleg_emi: reg["subdeleg_emision"],
            reg_pat: reg["rp"],
            escencial: reg["esencial"],
            clasificacion: reg["clasificacion"],
            cve_mov_p: reg["cve_mov_pat"],
            fec_mov: reg["fecha_mov_pat"],
            razon_social: reg["razon_social"],
            num_credito: reg["num_credito"],
            periodo: reg["periodo"],
            importe: reg["importe"],
            tipo_documento: reg["tipo_documento"],
            seguro: reg["seguro"],
            dias_estancia: reg["dias_estancia"],
            incidencia: reg["incidencia"],
            fec_incidencia: reg["fecha_incidencia"],
            estado: reg["estado"],
            por_importe: reg["POR IMPORTE"],
            por_antiguedad: reg["POR ANTIGUEDAD"],
            inc_actual: reg["INC ACTUAL"] ?? null,
            resultado: reg["RESULTADO"] ?? null,
          };
          coinValidado.push(regValid);
        });

        // Obtener todos los afil registrados y regresar solo el reg pat como afil
        const existingRegPats = await Afil.findAll({
          attributes: ["reg_pat"],
        }).then((afilRecords) => {
          return afilRecords.map((afil) => afil.reg_pat);
        });

        // Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
        const validRecords = await Promise.all(
          coinValidado.map(async (regValid) => {
            // Obtiene únicamente el reg_pat de ese objeto iterado
            const { reg_pat } = regValid;

            // Verificar si el valor de reg_pat ya existe en la tabla afil
            if (!existingRegPats.includes(reg_pat)) {
              registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
              return undefined;
            }

            return regValid;
          })
        );

        // Filtrar los registros válidos para insertar en la tabla RaleCop
        const recordsToInsert = validRecords.filter(
          (regValid) => regValid !== undefined
        );

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await Coin.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                  registrosNoInsertados.length > 0
                    ? `Los siguientes registros patronales no están registrados en la tabla afil: ${registrosNoInsertados.join(
                        ", "
                      )}`
                    : "Todos los registros patronales fueron insertador correctamente"
                }
              `,
              });
            })
            .catch((e) => {
              callback({
                status: false,
                msg: `No se pudo insertar el lote [${lote}-${
                  lote + 999
                }]. Error: ${e}`,
              });
            });
        } else {
          // No hay registros válidos para insertar
          callback({
            status: false,
            msg: `No se pudo insertar el lote [${lote}-${
              lote + 999
            }]. No hay registros válidos.`,
          });
        }
      } catch (e) {
        callback({
          status: false,
          msg: `No se pudo insertar el lote [${lote}-${
            lote + 999
          }]. Error: ${e}`,
        });
      }
    });

    // Registrar AFIL en la BD
    socket.on("client:insert-afil", (afil) => {
      let afilValidado = [];
      afil.forEach((reg, i) => {
        const regValid = {
          reg_pat: reg["REG PAT"] ? reg["REG PAT"] : "",
          patron: reg["PATRON"] ? reg["PATRON"] : "",
          actividad: reg["ACTIVIDAD"] ? reg["ACTIVIDAD"] : "",
          domicilio: reg["DOMICILIO"] ? reg["DOMICILIO"] : "",
          localidad: reg["LOCALIDAD"] ? reg["LOCALIDAD"] : "",
          ejecutor: reg["EJECUTOR"] ? reg["EJECUTOR"] : "foraneo",
          clave_eje: reg["CLAVE"] ? reg["CLAVE"] : "E-00000000",
          rfc: reg["RFC"] ? reg["RFC"] : "",
          cp: reg["C.P."] ? reg["C.P."] : 0,
        };
        afilValidado.push(regValid);
      });

      Afil.bulkCreate(afilValidado)
        .then(() => {
          socket.emit("server:insert-rslt", {
            msg: "Archivo AFIL insertado correctamente en la Base de Datos",
            success: true,
          });
        })
        .catch((e) => {
          socket.emit("server:insert-rslt", {
            msg: `Error: ${e}`,
            success: false,
          });
        });
    });

    socket.on("client:insert-rale-cop", async ({ rale, lote }, callback) => {
      try {
        let raleValidado = [];
        let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

        // Recorrer todo el objeto para asignarles los nombres que tienen en la bd
        rale.forEach((reg, i) => {
          // Asignar keys
          const regValid = {
            reg_pat: reg["REG. PATRONAL"],
            mov: reg["M"],
            patronal: reg["OV. PATRONA"],
            sect: reg["L SE"],
            nom_cred: reg["CT NUM.CRED."],
            ce: reg["C"],
            periodo: reg["E  PERIODO"],
            td: reg["TD"],
            fec_alta: reg["FECHA ALTA"],
            fec_notif: reg["FEC. NOTIF"],
            inc: reg[". INC"],
            fec_insid: reg[". FEC. INCID"],
            dias: reg[". DIAS"],
            importe: reg["I M P O R T E"],
            dcsc: reg["DC SC"],
          };
          raleValidado.push(regValid);
        });

        // Obtener todos los afil registrados y regresar solo el reg pat como afil
        const existingRegPats = await Afil.findAll({
          attributes: ["reg_pat"],
        }).then((afilRecords) => {
          return afilRecords.map((afil) => afil.reg_pat);
        });

        // Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
        const validRecords = await Promise.all(
          raleValidado.map(async (regValid) => {
            // Obtiene únicamente el reg_pat de ese objeto iterado
            const { reg_pat } = regValid;

            // Verificar si el valor de reg_pat ya existe en la tabla afil
            if (!existingRegPats.includes(reg_pat)) {
              registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
              return undefined;
            }

            return regValid;
          })
        );

        // Filtrar los registros válidos para insertar en la tabla RaleCop
        const recordsToInsert = validRecords.filter(
          (regValid) => regValid !== undefined
        );

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await RaleCop.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                  registrosNoInsertados.length > 0
                    ? `Los siguientes registros patronales no están registrados en la tabla afil: ${registrosNoInsertados.join(
                        ", "
                      )}`
                    : "Todos los registros patronales fueron insertador correctamente"
                }
              `,
              });
            })
            .catch((e) => {
              callback({
                status: false,
                msg: `No se pudo insertar el lote [${lote}-${
                  lote + 999
                }]. Error: ${e}`,
              });
            });
        } else {
          // No hay registros válidos para insertar
          callback({
            status: false,
            msg: `No se pudo insertar el lote [${lote}-${
              lote + 999
            }]. No hay registros válidos.`,
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("client:insert-rale-rcv", async ({ rale, lote }, callback) => {
      try {
        let raleValidado = [];
        let registrosNoInsertados = []; // Arreglo para almacenar los reg_pat no insertados

        // Recorrer todo el objeto para asignarles los nombres que tienen en la bd
        rale.forEach((reg, i) => {
          // Asignar keys
          const regValid = {
            reg_pat: reg["REG. PATRONAL"],
            mov: reg["M"],
            patronal: reg["OV. PATRONA"],
            sect: reg["L SE"],
            nom_cred: reg["CT NUM.CRED."],
            ce: reg["C"],
            periodo: reg["E  PERIODO"],
            td: reg["TD"],
            fec_alta: reg["FECHA ALTA"],
            fec_notif: reg["FEC. NOTIF"],
            inc: reg[". INC"],
            fec_insid: reg[". FEC. INCID"],
            dias: reg[". DIAS"],
            importe: reg["I M P O R T E"],
            dcsc: reg["DC SC"],
          };
          raleValidado.push(regValid);
        });

        // Obtener todos los afil registrados y regresar solo el reg pat como afil
        const existingRegPats = await Afil.findAll({
          attributes: ["reg_pat"],
        }).then((afilRecords) => {
          return afilRecords.map((afil) => afil.reg_pat);
        });

        // Realiza una promesa para validar todos los registros, haciendo un map para todo el arreglo de rale
        const validRecords = await Promise.all(
          raleValidado.map(async (regValid) => {
            // Obtiene únicamente el reg_pat de ese objeto iterado
            const { reg_pat } = regValid;

            // Verificar si el valor de reg_pat ya existe en la tabla afil
            if (!existingRegPats.includes(reg_pat)) {
              registrosNoInsertados.push(reg_pat); // Almacenar los reg_pat no insertados
              return undefined;
            }

            return regValid;
          })
        );

        // Filtrar los registros válidos para insertar en la tabla RaleCop
        const recordsToInsert = validRecords.filter(
          (regValid) => regValid !== undefined
        );

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await RaleRcv.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                  registrosNoInsertados.length > 0
                    ? `Los siguientes registros patronales no están registrados en la tabla afil: ${registrosNoInsertados.join(
                        ", "
                      )}`
                    : "Todos los registros patronales fueron insertador correctamente"
                }
              `,
              });
            })
            .catch((e) => {
              callback({
                status: false,
                msg: `No se pudo insertar el lote [${lote}-${
                  lote + 999
                }]. Error: ${e}`,
              });
            });
        } else {
          // No hay registros válidos para insertar
          callback({
            status: false,
            msg: `No se pudo insertar el lote [${lote}-${
              lote + 999
            }]. No hay registros válidos.`,
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Consultar Patrones Asignados
    socket.on('cliente:consultarPatronesAsignados', async (clave_eje) => {
      const pAsignados = await Afil.findAll({
        where: {clave_eje : clave_eje}
       });
      socket.emit('servidor:patronesAsignados', pAsignados);
    });

    // Consultar patrones no asignados
    socket.on('cliente:consultarPatronesNoAsignados', async (clave_eje) => {
      const pNoAsignados = await Afil.findAll({
        where: {
          clave_eje: { [Op.not]: clave_eje }
        }
       });
      socket.emit('servidor:patronesNoAsignados', pNoAsignados);
    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}

function processFile(file) {
  const workbook = XLSX.read(file, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    cellDates: true,
  });
  const headers = data.shift();

  const result = data.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      if (typeof row[index] === "object" && row[index] instanceof Date) {
        // Convertir la fecha a cadena de texto en el formato deseado
        obj[header] = row[index].toLocaleDateString("es-MX"); // Puedes ajustar el formato según tus necesidades
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });

  return result;
}

function processCoin(file) {
  const workbook = XLSX.read(file, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    cellDates: true,
  });

  // Obtener los índices de las columnas de interés
  const headerIndex = {
    "deleg_control": null,
    "subdeleg_control": null,
    "deleg_emision": null,
    "subdeleg_emision": null,
    "rp": null,
    "esencial": null,
    "clasificacion": null,
    "cve_mov_pat": null,
    "fecha_mov_pat": null,
    "razon_social": null,
    "num_credito": null,
    "periodo": null,
    "importe": null,
    "tipo_documento": null,
    "seguro": null,
    "dias_estancia": null,
    "incidencia": null,
    "fecha_incidencia": null,
    "estado": null,
    "POR IMPORTE": null,
    "POR ANTIGUEDAD": null,
    "INC ACTUAL": null,
    "RESULTADO": null,
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
        if (
          header === "rp" &&
          (value === null || value === "" || value === "TOTAL DE")
        )
          continue;
        
        // Dividir registro patronal
        if ( header === "rp" ) {
          value = value.substring(0, 3) +
            "-" +
            value.substring(3, 8) +
            "-" +
            value.substring(8);
        }
          
        // Poner en nulos los posibles vacíos
        if (
          header === "INC ACTUAL" ||
          header === "RESULTADO"
        )
          if (value === null || value === "" || value === undefined)
            value = null;

        // Convertir a bool los necesarios
        if (
          header === "POR ANTIGUEDAD" ||
          header === "POR IMPORTE" 
        )
          value = String(value).toUpperCase() == "SI" ? true : false;

        if (
          header === "esencial"
        )
          value = String(value).toUpperCase() == "S" ? true : false;

        // Convertir a INT
        if (
          header === "deleg_control" ||
          header === "subdeleg_control" ||
          header === "deleg_emision" ||
          header === "subdeleg_emision" ||
          header === "cve_mov_pat" ||
          header === "tipo_documento" ||
          header === "dias_estancia" ||
          header === "incidencia"
        )
          value = value !== null ? parseInt(value) : null;

        // Convertir a DOUBLE
        if (
          header === "num_credito" ||
          header === "importe"
        )
          value = value !== null ? parseFloat(value) : null;

        // Convertir en fecha
        if (
          header === "fecha_mov_pat" ||
          header === "fecha_incidencia"
        )
          value = value !== null ? new Date(value) : null;

        if ( header === "periodo" ) {
          let year = value.substring(0, 4);
          let month = value.substring(4, 6);
          value = year + "/" + month + "/" + "01";
          value = new Date(value)
        }

        obj[header] = value;
      }
    }
    result.push(obj);
  }
  return result;
}

function processRale(file) {
  const workbook = XLSX.read(file, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    cellDates: true,
  });

  // Obtener los índices de las columnas de interés
  const headerIndex = {
    "REG. PATRONAL": null,
    "M": null,
    "OV. PATRONA": null,
    "L SE": null,
    "CT NUM.CRED.": null,
    "C": null,
    "E  PERIODO": null,
    "TD": null,
    "FECHA ALTA": null,
    "FEC. NOTIF": null,
    ". INC": null,
    ". FEC. INCID": null,
    ". DIAS": null,
    "I M P O R T E": null,
    "DC SC": null,
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
  let raleType = "";

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};

    for (const header in headerIndex) {
      const columnIndex = headerIndex[header];
      if (columnIndex !== null && columnIndex < row.length) {
        let value = row[columnIndex];

        // Validar que exista reg_pat
        if (
          header === "REG. PATRONAL" &&
          (value === null || value === "" || value === "TOTAL DE")
        )
          continue;

        // Validar tipo de documento
        if ( header === 'TD' ) {
          if ( 
            value == 0 ||
            value == 2 ||
            value == 80 ||
            value == 81 ||
            value == 82 ||
            value == 88 ||
            value == 89
            )
            raleType = "COP"
          else if ( value == 60 ) 
            raleType = "RCV"
        }

        // Poner en nulos los posibles vacíos
        if (
          header === "DC SC" ||
          header === "C" ||
          header === "FEC. NOTIF" ||
          header === ". FEC. INCID"
        )
          if (value === null || value === "" || value === "#0/##/####" || value === undefined)
            value = null;

        // Convertir a número entero los que son necesarios
        if (
          header === "M" ||
          header === "L SE" ||
          header === "TD" ||
          header === ". INC" ||
          header === ". DIAS"
        )
          value = value !== null ? parseInt(value) : 0;

        // Convertir a número decimal los que son necesarios
        if (header === "CT NUM.CRED." || header === "I M P O R T E")
          value = value !== null ? parseFloat(value) : 0;

        // Convertir a fecha los que sean necesarios
        if (
          header === "OV. PATRONA" ||
          header === "FECHA ALTA" ||
          header === "FEC. NOTIF" ||
          header === ". FEC. INCID"
        )
          value = value !== null ? new Date(value) : null;

        // Dar formato al PERIODO
        if (header === "E  PERIODO") {
          if (value !== null) {
            let fec = value.split("/");
            let fecstr = `${fec[1]}/${fec[0]}/01`;
            value = new Date(Date.parse(fecstr));
          }
        }

        obj[header] = value;
      }
    }
    result.push(obj);
  }
  let ret = { result, raleType }
  return ret;
}

function processAfil(file) {
  const workbook = XLSX.read(file, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    cellDates: true,
  });

  // Obtener los índices de las columnas de interés
  const headerIndex = {
    "REG PAT": null,
    "PATRON": null,
    "ACTIVIDAD": null,
    "DOMICILIO": null,
    "LOCALIDAD": null,
    "RFC": null,
    "C.P.": null,
    "EJECUTOR": null,
    "CLAVE": null
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
  const dict = {
    "Alonso Ramírez Moreno": "E-10230434",
    "Claudia Rodríguez Zenteno": "E-10230158",
    "Griselda Ríco Gómez": "E-10230158",
    "Iván Germán Gutiérrez Ortega": "E-10230029",
    "María Magdalena López Ruíz": "E-10230265",
    "FORANEO": "E-00000000",
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};

    for (const header in headerIndex) {
      const columnIndex = headerIndex[header];
      if (columnIndex !== null && columnIndex < row.length) {
        let value = row[columnIndex];

        // Validar que exista reg_pat
        if (
          header === "REG PAT" &&
          (value === null || value === "" || value === "TOTAL DE")
        )
          continue;

        // Poner en nulos los posibles vacíos
        if (
          header === "C.P." ||
          header === "RFC" ||
          header === "EJECUTOR" ||
          header === "CLAVE" 
        )
          if ( value === null || value === "" || value === undefined )
            value = null;

        // Convertir a número entero los que son necesarios
        if ( header === "C.P." )
          value = value !== null ? parseInt(value) : 0;       

        obj[header] = value;
      }
    }  
    obj.EJECUTOR = obj.EJECUTOR ?? "FORANEO";
    obj.CLAVE = obj.CLAVE ?? dict[obj.EJECUTOR];
    result.push(obj);
  }
  return result;
}

export default socket;
