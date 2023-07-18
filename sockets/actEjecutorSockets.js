import Afil from "../models/afilModel.js";
import { Op } from "sequelize";

/**
 * Configura los eventos de actEjecutorSockets.
 * @param {Object} io - Instancia del servidor de socket.io.
 */
export function socket(io) {
	/**
	 * Evento de conexión de socket.
	 * @param {Object} socket - Instancia del socket conectado.
	 */
	io.on("connection", (socket) => {
		/**
		 * Consulta los patrones asignados.
		 * @param {string} clave_eje - Clave del ejecutor.
		 */
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

		/**
		 * Consulta los patrones no asignados.
		 * @param {string} clave_eje - Clave del ejecutor.
		 */
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
