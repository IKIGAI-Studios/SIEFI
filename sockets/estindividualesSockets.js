import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Coin from "../models/coinModel.js";
import { Op, Sequelize } from "sequelize";

export function socket(io) {
  io.on("connection", (socket) => {
    // Consultar Patrones por ejecutor
    socket.on(
      "cliente:ejecutorSeleccionadoEstInd",
      async ({ ejecutor, copDate, rcvDate, coinDate }) => {
        let data = {};

        const afil = await Afil.findAll({
          where: {
            ejecutor: ejecutor,
          },
        });
        let cop = await RaleCop.findAll({
          where: {
            reg_pat: {
              [Op.in]: afil.map((obj) => obj.reg_pat),
            },
            createdAt: {
              [Sequelize.Op.eq]: Sequelize.literal(`DATE('${copDate}')`),
            },
          },
        });
        let rcv = await RaleRcv.findAll({
          where: {
            reg_pat: {
              [Op.in]: afil.map((obj) => obj.reg_pat),
            },
            createdAt: {
              [Sequelize.Op.eq]: Sequelize.literal(`DATE('${rcvDate}')`),
            },
          },
        });
        let coin = await Coin.findAll({
          where: {
            reg_pat: {
              [Op.in]: afil.map((obj) => obj.reg_pat),
            },
            createdAt: {
              [Sequelize.Op.eq]: Sequelize.literal(`DATE('${coinDate}')`),
            },
          },
        });

        cop = cop.map((obj) => obj.dataValues);
        rcv = rcv.map((obj) => obj.dataValues);
        coin = coin.map((obj) => obj.dataValues);

        let copM = cop.map((c) => {
          if (c.td === 6) {
            return Object.assign(c, { type: "rcv" });
          } else if (c.td.toString().startsWith("8")) {
            return Object.assign(c, { type: "multas" });
          } else {
            return Object.assign(c, { type: "cuotas" });
          }
        });
        let rcvM = rcv.map((r) => Object.assign(r, { type: "rcv" }));
        let coinM = coin.map((r) => Object.assign(r, { type: "coin" }));

        data.rales = copM.concat(rcvM);
        data.coin = coinM;

        data.rales.sort((a, b) => {
          if (a.reg_pat !== b.reg_pat)
            return a.reg_pat.localeCompare(b.reg_pat);
          if (a.periodo !== b.periodo)
            return a.periodo.localeCompare(b.periodo);
          return a.td - b.td;
        });

        data.rales.map((rale) => {
          Object.assign(rale, {
            dias_rest: Math.floor(
              (new Date() - new Date(rale.fec_insid)) / 86400000
            ),
          });
          Object.assign(rale, {
            oportunidad:
              rale.inc == 2
                ? "En tiempo 2"
                : rale.dias_rest > 40
                ? "Fuera de tiempo"
                : "En tiempo 31",
          });
        });

        data.coin.sort((a, b) => {
          return a.reg_pat.localeCompare(b.reg_pat);
        });

        socket.emit("servidor:estIndividuales", { data });
      }
    );

    socket.on(
      "cliente:confrontaEstInd",
      async ({ ejecutor, copDate, rcvDate }) => {
        let data = {};

        const afil = await Afil.findAll({
          where: {
            ejecutor: ejecutor,
          },
        });
        let cop = await RaleCop.findAll({
          where: {
            reg_pat: {
              [Op.in]: afil.map((obj) => obj.reg_pat),
            },
            createdAt: {
              [Sequelize.Op.eq]: Sequelize.literal(`DATE('${copDate}')`),
            },
          },
        });
        let rcv = await RaleRcv.findAll({
          where: {
            reg_pat: {
              [Op.in]: afil.map((obj) => obj.reg_pat),
            },
            createdAt: {
              [Sequelize.Op.eq]: Sequelize.literal(`DATE('${rcvDate}')`),
            },
          },
        });

        cop = cop.map((obj) => obj.dataValues);
        rcv = rcv.map((obj) => obj.dataValues);

        let copM = cop.map((c) => {
          if (c.td === 6) {
            return Object.assign(c, { type: "rcv" });
          } else if (c.td.toString().startsWith("8")) {
            return Object.assign(c, { type: "multas" });
          } else {
            return Object.assign(c, { type: "cuotas" });
          }
        });
        let rcvM = rcv.map((r) => Object.assign(r, { type: "rcv" }));

        data.rales = copM.concat(rcvM);

        data.rales.sort((a, b) => {
          if (a.reg_pat !== b.reg_pat)
            return a.reg_pat.localeCompare(b.reg_pat);
          if (a.periodo !== b.periodo)
            return a.periodo.localeCompare(b.periodo);
          return a.td - b.td;
        });

        data.rales.map((rale) => {
          Object.assign(rale, {
            dias_rest: Math.floor(
              (new Date() - new Date(rale.fec_insid)) / 86400000
            ),
          });
          Object.assign(rale, {
            oportunidad:
              rale.inc == 2
                ? "En tiempo 2"
                : rale.dias_rest > 40
                ? "Fuera de tiempo"
                : "En tiempo 31",
          });
        });



        socket.emit("servidor:estIndividualesConfronta", { data });
      }
    );

    socket.on("cliente:registrosListadoPatronal", async (user) =>{

      //Obtener todos los registros de Rale COP que no estén cobrados, pero que estén en la tabla Afil. 
      const registrosCop = await RaleCop.findAll({
        attributes : ['reg_pat', 'dias', 'importe', 'nom_cred'],
        where : {cobrado: false}
      });

      //Obtener todos los registros de Rale RCV que no estén cobrados. 
      const registrosRcv = await RaleRcv.findAll({
        attributes : ['reg_pat', 'dias', 'importe', 'nom_cred'],
        where : {cobrado : false}
      });

        // Unir los registros en una variable y obtener importe y días
        const registrosNoCobrados = registrosCop.concat(registrosRcv);


      //Obtener los registros patronales que coincidan con el ejecutor y que se encuentren dentro del objeto anterior. 
      const registrosCopRcv = await Afil.findAll({
        attributes : ['reg_pat', 'patron', 'actividad', 'domicilio', 'localidad'],
        where: { 
          clave_eje: user, 
          reg_pat: registrosNoCobrados.map(rp => rp.reg_pat)
         }
      });

      socket.emit('servidor:registrosListadoPatronal', registrosCopRcv);

    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}
