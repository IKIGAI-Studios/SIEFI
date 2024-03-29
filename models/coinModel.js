/**
 * Modelo Coin.
 *
 * @typedef {Object} Coin
 * @property {number} id_coin - ID de la moneda. (PK)
 * @property {number} deleg_control - Delegación de control.
 * @property {number} subdeleg_control - Subdelegación de control.
 * @property {number} deleg_emi - Delegación de emisión.
 * @property {number} subdeleg_emi - Subdelegación de emisión.
 * @property {string} reg_pat - Número de registro del patrón.
 * @property {boolean} escencial - Indicador de si es esencial o no.
 * @property {string} clasificacion - Clasificación.
 * @property {number} cve_mov_p - Clave de movimiento.
 * @property {Date} fec_mov - Fecha de movimiento.
 * @property {string} razon_social - Razón social.
 * @property {number} num_credito - Número de crédito.
 * @property {Date} periodo - Período.
 * @property {number} importe - Importe.
 * @property {number} tipo_documento - Tipo de documento.
 * @property {string} seguro - Seguro.
 * @property {number} dias_estancia - Días de estancia.
 * @property {number} incidencia - Incidencia.
 * @property {Date} fec_incidencia - Fecha de incidencia.
 * @property {string} estado - Estado.
 * @property {boolean} por_importe - Indicador de si es por importe o no.
 * @property {boolean} por_antiguedad - Indicador de si es por antigüedad o no.
 * @property {string} inc_actual - Incidencia actual.
 * @property {string} resultado - Resultado.
 * @property {Date} createdAt - Fecha de creación.
 * @property {Date} updatedAt - Fecha de actualización.
 */

import { DataTypes } from "sequelize";
import sequelize from "../database.js";

/**
 * Definición del modelo Coin.
 */

const Coin = sequelize.define(
	"Coin",
	{
		id_coin: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		deleg_control: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		subdeleg_control: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		deleg_emi: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		subdeleg_emi: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		reg_pat: {
			type: DataTypes.STRING(12),
			allowNull: false,
		},
		escencial: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		clasificacion: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		cve_mov_p: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		fec_mov: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		razon_social: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		num_credito: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		periodo: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		importe: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		tipo_documento: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		seguro: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
		dias_estancia: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		incidencia: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		fec_incidencia: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		estado: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		por_importe: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		por_antiguedad: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		inc_actual: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		resultado: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "coin",
		timestamps: true,
	}
);

export default Coin;
