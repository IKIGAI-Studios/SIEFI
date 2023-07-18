/**
 * Modelo Afil63.
 *
 * @typedef {Object} Afil63
 * @property {string} reg_pat - Número de registro del patrón. (PK)
 * @property {string} patron - Nombre del patrón.
 * @property {string} actividad - Actividad del patrón.
 * @property {string} domicilio - Domicilio del patrón.
 * @property {string} localidad - Localidad del patrón.
 * @property {string} ejecutor - Ejecutor del patrón.
 * @property {string} clave_eje - Clave del ejecutor del patrón.
 * @property {string} rfc - RFC del patrón.
 * @property {number} cp - Código postal del patrón.
 **/

import { DataTypes } from "sequelize";
import sequelize from "../database.js";

/**
 * Definición del modelo Afil63.
*/

const Afil63 = sequelize.define(
	"Afil63",
	{
		reg_pat: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			allowNull: false,
		},
		patron: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		actividad: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		domicilio: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		localidad: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		ejecutor: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		clave_eje: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
		rfc: {
			type: DataTypes.STRING(15),
			allowNull: false,
		},
		cp: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: "afil63",
		timestamps: true,
	}
);

export default Afil63;
