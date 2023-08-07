import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pc from "picocolors";

dotenv.config();

/**
 * Instancia de Sequelize para la conexión a la base de datos.
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT),
		dialect: "mysql",
		logging: false, // Establecer a false para desactivar los mensajes de sequelize
	}
);

/**
 * Sincroniza los modelos con la base de datos.
 * @returns {Promise} Una promesa que se resuelve una vez que se ha completado la sincronización.
 */
sequelize
	.sync({ force: false })
	.then(() => {
		console.info(pc.cyan("Conexion correcta a la Base de Datos"));
	})
	.catch((e) => {
		console.error(`Error: ${e}`);
	});

export default sequelize;
