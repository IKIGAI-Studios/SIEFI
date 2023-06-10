import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import { Op, Sequelize } from 'sequelize';

export function socket(io) {
  io.on("connection", (socket) => {
    // Consultar Patrones por ejecutor
    socket.on('cliente:ejecutorSeleccionadoEstInd', async ({ ejecutor, copDate, rcvDate }) => {
      const afil = await Afil.findAll({
        where: {
            ejecutor: ejecutor
        }
      });
      const cop = await RaleCop.findAll({
        where: {
            reg_pat: {
                [Op.in]: afil.map(obj => obj.reg_pat)
            },
            createdAt: { 
                [Sequelize.Op.eq]: Sequelize.literal(`DATE('${copDate}')`)
            }
        }
      });
      const rcv = await RaleRcv.findAll({
        where: {
            reg_pat: {
                [Op.in]: afil.map(obj => obj.reg_pat)
            },
            createdAt: { 
                [Sequelize.Op.eq]: Sequelize.literal(`DATE('${rcvDate}')`)
            }
        }
      });
      
      let copM = cop.map((c) => Object.assign(c, { type: "cop" }));
      let rcvM = rcv.map((r) => Object.assign(r, { type: "rcv" }));


      let data = copM.concat(rcvM);

      data.sort((a, b) => {
            if (a.reg_pat !== b.reg_pat) return a.reg_pat.localeCompare(b.reg_pat);
            if (a.periodo !== b.periodo) return a.periodo.localeCompare(b.periodo);
            return a.td - b.td;
      });
    
      socket.emit('servidor:estIndividuales', data);
    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}