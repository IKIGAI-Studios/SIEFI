import Afil from "../models/afilModel.js";
import { Op } from "sequelize";

export function socket(io) {
  io.on("connection", (socket) => {
    // Consultar Patrones Asignados
    socket.on("cliente:consultarPatronesAsignados", async (clave_eje) => {
      try {
        const pAsignados = await Afil.findAll({
          where: { clave_eje: clave_eje },
        });
        socket.emit("servidor:patronesAsignados", pAsignados);
      } catch (error) {
        console.log(error);
      }
    });

    // Consultar patrones no asignados
    socket.on("cliente:consultarPatronesNoAsignados", async (clave_eje) => {
      try {
        const pNoAsignados = await Afil.findAll({
          where: {
            clave_eje: { [Op.not]: clave_eje },
          },
        });
        socket.emit("servidor:patronesNoAsignados", pNoAsignados);
      } catch (error) {
        console.log(error);
      }
    });
  });
}
