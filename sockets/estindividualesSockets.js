import Afil from "../models/afilModel.js";

export function socket(io) {
  io.on("connection", (socket) => {
    // Consultar Patrones por ejecutor
    socket.on('cliente:ejecutorSeleccionado', async (nombreEjecutor) => {
      const patrones = await Afil.findAll({
        where: {ejecutor: nombreEjecutor}
      });
    
      const patronesSeleccionados = patrones.map(patron => {
        return {
          patron: patron.patron,
          actividad: patron.actividad,
          localidad: patron.localidad
        };
      });
    
      socket.emit('servidor:estIndividuales', patronesSeleccionados);
    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}