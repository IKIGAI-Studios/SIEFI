import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRCV from "../models/raleRCVModel.js";
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
import Ejecutor from "../models/ejecutorModel.js";

export function socket(io) {
  io.on("connection", (socket) => {

    // Socket para obtener los registros en las tablas Rale Cop que no estén cobrados 
    

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}