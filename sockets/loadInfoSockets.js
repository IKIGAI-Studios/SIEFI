import XLSX from "xlsx";
import Coin from "../models/coinModel.js";
import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Ejecutor from "../models/ejecutorModel.js";
import sequelize from "../database.js";

export function socket(io) {
  io.on("connection", (socket) => {
    // Cargar archivo
    socket.on("client:load-coin", ({ file }) => {
      const result = processCoin(file);
      socket.emit("server:result-coin", result);
    });

    socket.on("client:load-afil", async ({ file }) => {
      const result = await processAfil(file);
      socket.emit("server:result-afil", result);
    });

    socket.on("client:load-rale", ({ file }, callback) => {
      const { result, raleType } = processRale(file);
      if (raleType == "COP") socket.emit("server:result-rale-cop", result);
      else if (raleType == "RCV") socket.emit("server:result-rale-rcv", result);
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

        let reg_pat_no_ins = []
        for (var i = 0; i < registrosNoInsertados.length; i++) {
            if (reg_pat_no_ins.indexOf(registrosNoInsertados[i]) === -1) {
                // Si el elemento no existe en el nuevo array, agregarlo
                reg_pat_no_ins.push(registrosNoInsertados[i]);
            }
        }

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await Coin.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                    reg_pat_no_ins.length > 0
                    ? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
                    reg_pat_no_ins
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
    socket.on("client:insert-afil", ({ afil, lote, lenght }, callback) => {
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
          callback({
            status: true,
            msg: `Lote [${lote}-${
              lote + 999 > lenght ? lenght : lote + 999
            }] insertado correctamente`,
          });
        })
        .catch((e) => {
          callback({
            status: false,
            msg: `Lote [${lote}-${
              lote + 999 > lenght ? lenght : lote + 999
            }] no se pudo insertar. Error ${e}`,
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
            patronal: reg["OV. PATRONAL"],
            sect: reg["SECT"],
            nom_cred: reg["NUM.CRED."],
            ce: reg["CE"],
            periodo: reg["PERIODO"],
            td: reg["TD"],
            fec_alta: reg["FECHA ALTA"],
            fec_notif: reg["FEC. NOTIF."],
            inc: reg["INC."],
            fec_insid: reg["FEC. INCID."],
            dias: reg["DIAS"],
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

        let reg_pat_no_ins = []
        for (var i = 0; i < registrosNoInsertados.length; i++) {
            if (reg_pat_no_ins.indexOf(registrosNoInsertados[i]) === -1) {
                // Si el elemento no existe en el nuevo array, agregarlo
                reg_pat_no_ins.push(registrosNoInsertados[i]);
            }
        }

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await RaleCop.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                    reg_pat_no_ins.length > 0
                    ? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
                    reg_pat_no_ins
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
            patronal: reg["OV. PATRONAL"],
            sect: reg["SECT"],
            nom_cred: reg["NUM.CRED."],
            ce: reg["CE"],
            periodo: reg["PERIODO"],
            td: reg["TD"],
            fec_alta: reg["FECHA ALTA"],
            fec_notif: reg["FEC. NOTIF."],
            inc: reg["INC."],
            fec_insid: reg["FEC. INCID."],
            dias: reg["DIAS"],
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

        let reg_pat_no_ins = []
        for (var i = 0; i < registrosNoInsertados.length; i++) {
            if (reg_pat_no_ins.indexOf(registrosNoInsertados[i]) === -1) {
                // Si el elemento no existe en el nuevo array, agregarlo
                reg_pat_no_ins.push(registrosNoInsertados[i]);
            }
        }

        if (recordsToInsert.length > 0) {
          // Insertar los registros válidos en la tabla RaleCop
          await RaleRcv.bulkCreate(recordsToInsert, { logging: false })
            .then(() => {
              callback({
                status: true,
                msg: `
                Lote [${lote}-${lote + 999}] insertado correctamente
                ${
                    reg_pat_no_ins.length > 0
                    ? `| ${reg_pat_no_ins.length} registros no fueron insertados debido a que no estaban registrados en la tabla afil: ` +
                        reg_pat_no_ins
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

    // Obtener fechas de registro en la tabla Afil
    socket.on("cliente:consultarRegistrosAfil", async () => {
      try {
        const fechasRegistro = await Afil.findAll({
          attributes: [
            [sequelize.fn("DISTINCT", sequelize.col("createdAt")), "createdAt"],
          ],
        });

        const fechasDistintas = fechasRegistro.map(
          (registro) => registro.dataValues.createdAt
        );

        socket.emit("servidor:consultarRegistrosAfil", fechasDistintas);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al consultar los registros de Afil."
        );
      }
    });

    // Filtrar los registros Afil por fecha.
    socket.on("cliente:filtrarAfil", async (fechaAfil) => {
      try {
        const afilFiltrado = await Afil.findAll({
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("createdAt")),
            fechaAfil
          ),
        });
        socket.emit("servidor:filtrarAfil", afilFiltrado);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Afil por fecha."
        );
      }
    });

    // Obtener fechas de registro en la tabla Coin
    socket.on("cliente:consultarRegistrosCoin", async () => {
      try {
        const fechasRegistro = await Coin.findAll({
          attributes: [
            [sequelize.fn("DISTINCT", sequelize.col("createdAt")), "createdAt"],
          ],
        });

        const fechasDistintas = fechasRegistro.map(
          (registro) => registro.dataValues.createdAt
        );

        socket.emit("servidor:consultarRegistrosCoin", fechasDistintas);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al consultar los registros de Coin."
        );
      }
    });

    // Filtrar los registros Coin por fecha.
    socket.on("cliente:filtrarCoin", async (fechaCoin) => {
      try {
        const coinFiltrado = await Coin.findAll({
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("createdAt")),
            fechaCoin
          ),
        });
        socket.emit("servidor:filtrarCoin", coinFiltrado);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Coin por fecha."
        );
      }
    });

    // Obtener fechas de registro en la tabla Rale COP
    socket.on("cliente:consultarRegistrosRaleCOP", async () => {
      try {
        const fechasRegistro = await RaleCop.findAll({
          attributes: [
            [sequelize.fn("DISTINCT", sequelize.col("createdAt")), "createdAt"],
          ],
        });

        const fechasDistintas = fechasRegistro.map(
          (registro) => registro.dataValues.createdAt
        );

        socket.emit("servidor:consultarRegistrosRaleCOP", fechasDistintas);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al consultar los registros de Rale COP."
        );
      }
    });

    // Filtrar los registros Rale COP por fecha.
    socket.on("cliente:filtrarRaleCOP", async (fechaRaleCOP) => {
      try {
        const raleCOPFiltrado = await RaleCop.findAll({
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("createdAt")),
            fechaRaleCOP
          ),
        });
        socket.emit("servidor:filtrarRaleCOP", raleCOPFiltrado);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Rale COP por fecha."
        );
      }
    });

    // Obtener fechas de registro en la tabla Rale RCV
    socket.on("cliente:consultarRegistrosRaleRCV", async () => {
      try {
        const fechasRegistro = await RaleRcv.findAll({
          attributes: [
            [sequelize.fn("DISTINCT", sequelize.col("createdAt")), "createdAt"],
          ],
        });

        const fechasDistintas = fechasRegistro.map(
          (registro) => registro.dataValues.createdAt
        );

        socket.emit("servidor:consultarRegistrosRaleRCV", fechasDistintas);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al consultar los registros del rale RCV."
        );
      }
    });

    // Filtrar los registros Rale RCV por fecha.
    socket.on("cliente:filtrarRaleRCV", async (fechaRaleRCV) => {
      try {
        const raleRCVFiltrado = await RaleRcv.findAll({
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("createdAt")),
            fechaRaleRCV
          ),
        });
        socket.emit("servidor:filtrarRaleRCV", raleRCVFiltrado);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Rale RCV por fecha."
        );
      }
    });

    // Filtrar los registros Rale RCV por fecha.
    socket.on("cliente:filtrarRaleRCV", async (fechaRaleRCV) => {
      try {
        const raleRCVFiltrado = await RaleRcv.findAll({
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("createdAt")),
            fechaRaleRCV
          ),
        });
        socket.emit("servidor:filtrarRaleRCV", raleRCVFiltrado);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Rale RCV por fecha."
        );
      }
    });

    //Obtener fechas de las tablas
    socket.on("cliente:consultarRegistros", async (valor) => {
      try {
        let fechasRegistro;

        if (valor == "afil") {
          fechasRegistro = await Afil.findAll({
            attributes: [
              [
                sequelize.fn("DISTINCT", sequelize.col("createdAt")),
                "createdAt",
              ],
            ],
          });
        }
        if (valor == "coin") {
          fechasRegistro = await Coin.findAll({
            attributes: [
              [
                sequelize.fn("DISTINCT", sequelize.col("createdAt")),
                "createdAt",
              ],
            ],
          });
        }
        if (valor == "cop") {
          fechasRegistro = await RaleCop.findAll({
            attributes: [
              [
                sequelize.fn("DISTINCT", sequelize.col("createdAt")),
                "createdAt",
              ],
            ],
          });
        }
        if (valor == "rcv") {
          fechasRegistro = await RaleRcv.findAll({
            attributes: [
              [
                sequelize.fn("DISTINCT", sequelize.col("createdAt")),
                "createdAt",
              ],
            ],
          });
        }
        if (fechasRegistro) {
          const fechasDistintas = fechasRegistro.map(
            (registro) => registro.dataValues.createdAt
          );
          socket.emit("servidor:consultarRegistros", fechasDistintas, valor);
        }
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al consultar los registros de Coin."
        );
      }
    });

    // Filtrar los registros Coin por fecha.
    socket.on("cliente:filtrarArchivos", async (fecha, valor) => {
      try {
        let archivoFiltrado;

        if (valor == "afil") {
          archivoFiltrado = await Afil.findAll({
            where: sequelize.where(
              sequelize.fn("DATE", sequelize.col("createdAt")),
              fecha
            ),
          });
        }
        if (valor == "coin") {
          archivoFiltrado = await Coin.findAll({
            where: sequelize.where(
              sequelize.fn("DATE", sequelize.col("createdAt")),
              fecha
            ),
          });
        }
        if (valor == "cop") {
          archivoFiltrado = await RaleCop.findAll({
            where: sequelize.where(
              sequelize.fn("DATE", sequelize.col("createdAt")),
              fecha
            ),
          });
        }
        if (valor == "rcv") {
          archivoFiltrado = await RaleRcv.findAll({
            where: sequelize.where(
              sequelize.fn("DATE", sequelize.col("createdAt")),
              fecha
            ),
          });
        }
        socket.emit("servidor:filtrarArchivo", archivoFiltrado, valor);
      } catch (error) {
        // Manejar el error
        console.error(error);
        socket.emit(
          "servidor:error",
          "Error al filtrar los registros de Coin por fecha."
        );
      }
    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
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
    deleg_control: null,
    subdeleg_control: null,
    deleg_emision: null,
    subdeleg_emision: null,
    rp: null,
    esencial: null,
    clasificacion: null,
    cve_mov_pat: null,
    fecha_mov_pat: null,
    razon_social: null,
    num_credito: null,
    periodo: null,
    importe: null,
    tipo_documento: null,
    seguro: null,
    dias_estancia: null,
    incidencia: null,
    fecha_incidencia: null,
    estado: null,
    "POR IMPORTE": null,
    "POR ANTIGUEDAD": null,
    "INC ACTUAL": null,
    RESULTADO: null,
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
        if (header === "rp") {
          value =
            value.substring(0, 3) +
            "-" +
            value.substring(3, 8) +
            "-" +
            value.substring(8);
        }

        // Poner en nulos los posibles vacíos
        if (header === "INC ACTUAL" || header === "RESULTADO")
          if (value === null || value === "" || value === undefined)
            value = null;

        // Convertir a bool los necesarios
        if (header === "POR ANTIGUEDAD" || header === "POR IMPORTE")
          value = String(value).toUpperCase() == "SI" ? true : false;

        if (header === "esencial")
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
        if (header === "num_credito" || header === "importe")
          value = value !== null ? parseFloat(value) : null;

        // Convertir en fecha
        if (header === "fecha_mov_pat" || header === "fecha_incidencia")
          value = value !== null ? new Date(value) : null;

        if (header === "periodo") {
          let year = value.substring(0, 4);
          let month = value.substring(4, 6);
          value = year + "/" + month + "/" + "01";
          value = new Date(value);
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
    M: null,
    "OV. PATRONAL": null,
    SECT: null,
    "NUM.CRED.": null,
    CE: null,
    PERIODO: null,
    TD: null,
    "FECHA ALTA": null,
    "FEC. NOTIF.": null,
    "INC.": null,
    "FEC. INCID.": null,
    DIAS: null,
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
        obj[header] = value;
      }
    }
    // Validar que exista reg_pat
    if (
      obj["REG. PATRONAL"] === null ||
      obj["REG. PATRONAL"] === undefined ||
      obj["REG. PATRONAL"] === "" ||
      obj["REG. PATRONAL"] === "TOTAL DE" ||
      obj["REG. PATRONAL"].includes(".") ||
      obj["REG. PATRONAL"].includes(" ") ||
      obj["REG. PATRONAL"] === "D" ||
      obj["REG. PATRONAL"] === "COBR2303" ||
      obj["REG. PATRONAL"] === "ACT.ECO" ||
      obj["REG. PATRONAL"] === "IMPORTE:" ||
      obj["REG. PATRONAL"] === "IMPORTE" ||
      obj["REG. PATRONAL"] === "REG. PATRONAL"
    )
      continue;

    // Validar tipo de documento
    if (
      obj["TD"] == 0 ||
      obj["TD"] == 2 ||
      obj["TD"] == 80 ||
      obj["TD"] == 81 ||
      obj["TD"] == 82 ||
      obj["TD"] == 88 ||
      obj["TD"] == 89
    )
      raleType = "COP";
    else if (obj["TD"] == 60) raleType = "RCV";

    // Poner en nulos los posibles vacíos
    if (
      obj["DC SC"] === null ||
      obj["DC SC"] === "" ||
      obj["DC SC"] === "#0/##/####" ||
      obj["DC SC"] === undefined
    )
      obj["DC SC"] = null;
    if (
      obj["CE"] === null ||
      obj["CE"] === "" ||
      obj["CE"] === "#0/##/####" ||
      obj["CE"] === undefined
    )
      obj["CE"] = null;
    if (
      obj["FEC. NOTIF."] === null ||
      obj["FEC. NOTIF."] === "" ||
      obj["FEC. NOTIF."] === "#0/##/####" ||
      obj["FEC. NOTIF."] === "0/ /" ||
      obj["FEC. NOTIF."] === undefined
    )
      obj["FEC. NOTIF."] = null;
    if (
      obj["FEC. INCID."] === null ||
      obj["FEC. INCID."] === "" ||
      obj["FEC. INCID."] === "#0/##/####" ||
      obj["FEC. INCID."] === undefined
    )
      obj["FEC. INCID."] = null;

    // Convertir a numeros los posibles
    obj["M"] = obj["M"] ? parseInt(obj["M"]) : 0;
    obj["SECT"] = obj["SECT"] ? parseInt(obj["SECT"]) : 0;
    obj["TD"] = obj["TD"] ? parseInt(obj["TD"]) : 0;
    obj["INC."] = obj["INC."] ? parseInt(obj["INC."]) : 0;
    obj["DIAS"] = obj["DIAS"] ? parseInt(obj["DIAS"]) : 0;

    // Convertir a número decimal los que son necesarios
    obj["NUM.CRED."] = obj["NUM.CRED."] ? parseFloat(obj["NUM.CRED."]) : 0;
    obj["I M P O R T E"] = obj["I M P O R T E"]
      ? parseFloat(obj["I M P O R T E"].replace(/,/g, "").replace(".", "."))
      : 0;

    // Convertir a fecha los que sean necesarios
    obj["OV. PATRONAL"] = obj["OV. PATRONAL"]
      ? new Date(obj["OV. PATRONAL"].toString())
      : null;
    obj["FECHA ALTA"] = obj["FECHA ALTA"]
      ? new Date(obj["FECHA ALTA"].toString())
      : null;
    obj["FEC. NOTIF."] = obj["FEC. NOTIF."]
      ? new Date(obj["FEC. NOTIF."].toString())
      : null;
    obj["FEC. INCID."] = obj["FEC. INCID."]
      ? new Date(obj["FEC. INCID."].toString())
      : null;

    // Dar formato al PERIODO
    if (obj["PERIODO"]) {
      let fec = obj["PERIODO"].split("/");
      let fecstr = `${fec[1]}/${fec[0]}/01`;
      obj["PERIODO"] = new Date(Date.parse(fecstr));
    }

    result.push(obj);
  }
  let ret = { result, raleType };
  return ret;
}

async function processAfil(file) {
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
    PATRON: null,
    ACTIVIDAD: null,
    DOMICILIO: null,
    LOCALIDAD: null,
    RFC: null,
    "C.P.": null,
    EJECUTOR: null,
    CLAVE: null,
  };

  // Buscar los índices de las columnas en el encabezado
  const headers = data[0];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (headerIndex.hasOwnProperty(header)) {
      headerIndex[header] = i;
    }
  }

  let eje = await Ejecutor.findAll();
  eje = eje.map((obj) => obj.dataValues);
  let dict = {};
  eje.map((item) => {
    if (item.type === "ejecutor" && item.status == 1) {
      dict[item.nombre] = item.clave_eje;
    }
  });
  dict["No asignado"] = "E-00000000";

  // Procesar los datos
  const result = [];
  //   const dict = {
  //     "Alonso Ramírez Moreno": "E-10230434",
  //     "Claudia Rodríguez Zenteno": "E-10230158",
  //     "Griselda Ríco Gómez": "E-10230163",
  //     "Iván Germán Gutiérrez Ortega": "E-10230029",
  //     "María Magdalena López Ruíz": "E-10230265",
  //     "FORANEO": "E-00000000",
  //   }

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
          if (value === null || value === "" || value === undefined)
            value = null;

        // Convertir a número entero los que son necesarios
        if (header === "C.P.") value = value !== null ? parseInt(value) : 0;

        obj[header] = value;
      }
    }
    obj.EJECUTOR = obj.EJECUTOR == 0 || obj.EJECUTOR == "" || obj.EJECUTOR === null ? "No asignado" : obj.EJECUTOR;
    obj.CLAVE = dict[obj.EJECUTOR];
    result.push(obj);
  }
  return result;
}
