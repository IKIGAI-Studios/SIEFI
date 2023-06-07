import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Afil63 from "../models/afilModel.js";
import Ejecutor from "../models/ejecutorModel.js";
import sequelize from "../database.js";
import Confronta from "../models/confrontaModel.js";

export function socket(io) {
  io.on("connection", (socket) => {
        // Filtrar los registros Rales por fecha. 
        socket.on('cliente:filtrarRales', async ({ rcv, cop, type }) => {
            try {
                const raleRCVFiltrado = await RaleRcv.findAll({
                    where: sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), rcv)
                });
                const raleCOPFiltrado = await RaleCop.findAll({
                    where: sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), cop)
                });
                socket.emit('servidor:filtrarRales', { raleRCVFiltrado, raleCOPFiltrado, type });
            } catch (error) {
                // Manejar el error
                console.error(error);
            }
        });

        // Obtener fechas de registro en la tabla Afil
        socket.on('cliente:confrontarData', async () => {
            try {
                const patrones = await Afil63.findAll();
                const ejecutores = await Ejecutor.findAll();
                socket.emit('servidor:confrontarData', { patrones, ejecutores });
            } catch (error) {
                // Manejar el error
                console.error(error);
                socket.emit('servidor:error', 'Error al consultar los registros de Afil.');
            }
        });

        // Obtener confrontas por fechas
        socket.on('cliente:consultarConfrontas', async () => {
            try {
                const confronta = await Confronta.findAll({
                    attributes: [[sequelize.fn('DISTINCT', sequelize.col('createdAt')), 'createdAt']]
                });
                socket.emit('servidor:consultarConfrontas', { confronta });
            } catch (error) {
                // Manejar el error
                console.error(error);
            }
        });

        // Eliminar confrontas por fechas
        socket.on('cliente:deleteConfronta', async (date, callback) => {
            try {
                await Confronta.destroy({
                    where: sequelize.where(
                        sequelize.fn('DATE', sequelize.col('createdAt')),
                        date
                      )
                })
                .then(() => {
                    callback({status: true});
                })
                .catch ((e) => {
                    callback({status: false});
                    console.log(e)
                });
            } catch (error) {
                // Manejar el error
                callback({status: false});
            }
        });

        // guardar
        socket.on('cliente:saveConfronta', async ({ confronta, lote, lenght }, callback) => {
            try {
                await Confronta.bulkCreate(confronta, { logging: false })
                .then(() => {
                    callback({
                        status: true,
                        msg: `Lote [${lote}-${lote + 999 > lenght ? lenght : lote + 999 }] insertado correctamente`,
                    });
                })
                .catch((e) => {
                    callback({
                        status: false,
                        msg: `No se pudo insertar el lote [${lote}-${lote + 999 > lenght ? lenght : lote + 999 }]. Error: ${e}`,
                    });
                });
            } catch (error) {
                // Manejar el error
                console.error(error);
                callback({
                    status: false,
                    msg: `No se pudo insertar el lote [${lote}-${lote + 999 > lenght ? lenght : lote + 999 }]. Error: ${e}`,
                });
            }
        });
    });
}