import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Afil63 = sequelize.define('Afil63', {
  reg_pat: {
    type: DataTypes.STRING(12),
    primaryKey: true,
    allowNull: false
  },
  patron: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  actividad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  domicilio: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ejecutor: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  clave_eje: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  rfc: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  cp: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'afil63',
  timestamps: true,
});

export default Afil63;