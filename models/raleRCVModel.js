/**
 * Modelo RaleRcv.
 *
 * @typedef {Object} RaleRcv
 * @property {string} reg_pat - Número de registro del patrón. (PK)
 * @property {number} mov - Movimiento.
 * @property {Date} patronal - Patronal.
 * @property {number} sect - Sector.
 * @property {number} nom_cred - Número de crédito.
 * @property {string} ce - CE.
 * @property {Date} periodo - Período.
 * @property {number} td - TD.
 * @property {Date} fec_alta - Fecha de alta.
 * @property {Date} fec_notif - Fecha de notificación.
 * @property {number} inc - Incidencia.
 * @property {Date} fec_insid - Fecha de incidencia.
 * @property {number} dias - Días.
 * @property {number} importe - Importe.
 * @property {number} dcsc - DCSC.
 * @property {boolean} cobrado - Indicador de si ha sido cobrado o no.
 * @property {boolean} citatorio - Indicador de si se ha generado un citatorio o no.
 * @property {number} cobrado_patron - Monto cobrado al patrón.
 * @property {number} gastos_ejecutor - Gastos del ejecutor.
 * @property {string} fol_sua - Folio SUA.
 * @property {string} res_dil - Resultado de la diligencia.
 */

import { DataTypes } from "sequelize";
import sequelize from "../database.js";

/**
 * Definición del modelo RaleRcv.
 */

const RaleRcv = sequelize.define(
	"rale_rcv",
	{
		reg_pat: {
			type: DataTypes.STRING(12),
			allowNull: false,
			primaryKey: true,
			// @ts-ignore
			charset: "utf8",
			collate: "utf8_general_ci",
		},
		mov: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		patronal: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		sect: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		nom_cred: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		ce: {
			type: DataTypes.STRING(5),
			allowNull: false,
		},
		periodo: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		td: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		fec_alta: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		fec_notif: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		inc: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		fec_insid: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		dias: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		importe: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		dcsc: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		cobrado: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
		},
		citatorio: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
		},
		cobrado_patron: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		gastos_ejecutor: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		fol_sua: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		res_dil: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
	},
	{
		tableName: "rale_rcv",
		timestamps: true,
		engine: "InnoDB",
		charset: "utf8",
		collate: "utf8_general_ci",
	}
);

export default RaleRcv;
