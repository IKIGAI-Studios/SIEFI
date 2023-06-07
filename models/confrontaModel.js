import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Confronta = sequelize.define('confronta', {
    id_confronta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    reg_pat: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    clave_eje: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    nom_cred: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    buscar_2_y_31: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    buscar_cambio_inc: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    dias_rest: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    oportunidad: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    quemados: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    programable: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    buscar_pago: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    re_cuotas: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    re_rcv: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    re_multas: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    re_aud: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    resultado_concatenado: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'confronta',
    timestamps: true
  });

export default Confronta;
