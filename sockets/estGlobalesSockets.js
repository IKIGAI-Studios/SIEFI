import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRcv from "../models/raleRCVModel.js";
import Coin from "../models/coinModel.js";
import { Op, Sequelize } from "sequelize";
import Ejecutor from "../models/ejecutorModel.js";

export function socket(io) {
  io.on("connection", (socket) => {
    // Consultar Patrones por ejecutor
    socket.on(
      "cliente:ejecutorSeleccionadoEstGlob",
      async ({ copDate, rcvDate, coinDate }) => {
        let data = {};

        // Obtener los ejecutores que no sean No Asignado, que sean ejecutores y esten activos
        const ejecutores = await Ejecutor.findAll({
          where: {
            nombre: {
              [Sequelize.Op.ne]: "No asignado",
            },
            type: "ejecutor",
            status: 1,
          },
        });

        // Obtener los afil que no esten asignados a No Asignado
        const afil = await Afil.findAll({
          where: {
            ejecutor: {
              [Sequelize.Op.ne]: "No asignado",
            },
          },
        });

        // Obtener los rale cop que esten dentro de los afiles que no tienen como ejecutor No Asignado y hayan sido creados en una fecha en especifico
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

        // Obtener los rale rcv que esten dentro de los afiles que no tienen como ejecutor No Asignado y hayan sido creados en una fecha en especifico
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

        // Obtener el coin que esten dentro de los afiles que no tienen como ejecutor No Asignado y hayan sido creados en una fecha en especifico
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

        // Obtener unicamente los dataValues del objeto regresado de la BD
        cop = cop.map((obj) => obj.dataValues);
        rcv = rcv.map((obj) => obj.dataValues);
        coin = coin.map((obj) => obj.dataValues);

        // Asignar etiqueta del tipo que sea segun su tipo de docuemnto
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

        // Juntar archivo rales y coin en un mismo objeto
        data.rales = copM.concat(rcvM);
        data.coin = coinM;

        // Ordenar por reg__pat, por periodo y luego por tipo de docuemtno
        data.rales.sort((a, b) => {
          if (a.reg_pat !== b.reg_pat)
            return a.reg_pat.localeCompare(b.reg_pat);
          if (a.periodo !== b.periodo)
            return a.periodo.localeCompare(b.periodo);
          return a.td - b.td;
        });

        // Asignar los dias faltantes
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

        socket.emit("servidor:estGlobales", { data, ejecutores });
      }
    );

    socket.on("cliente:confrontaEstGlo", async ({ copDate, rcvDate }) => {
      let data = {};

      const afil = await Afil.findAll({
        where: {
          ejecutor: {
            [Sequelize.Op.ne]: "No asignado",
          },
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
        if (a.reg_pat !== b.reg_pat) return a.reg_pat.localeCompare(b.reg_pat);
        if (a.periodo !== b.periodo) return a.periodo.localeCompare(b.periodo);
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

      socket.emit("servidor:estGlobalesConfronta", { data });
    });

    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}
