import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Afil63 from "../models/afilModel.js";
import sequelize from "../database.js";

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
        socket.on('cliente:consultarConfrontaAfil', async () => {
            try {
                const patrones = await Afil63.findAll()
                .then(() => {
                    socket.emit('servidor:consultarConfrontaAfil', patrones);
                    console.log("Socket consultar contronta afil")
                }) 
                .catch((e) => {
                    console.error(error);
                });
            } catch (error) {
                // Manejar el error
                console.error(error);
                socket.emit('servidor:error', 'Error al consultar los registros de Afil.');
            }
        });
    });
}