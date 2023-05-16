import { DataTypes } from "sequelize";
import sequelize from "../database.js" ;

const Coin = sequelize.define('Coin', {
  id_coin: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deleg_control: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subdeleg_control: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deleg_emi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subdeleg_emi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reg_pat: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  escencial: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  clasificacion: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cve_mov_p: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fec_mov: {
    type: DataTypes.DATE,
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  num_credito: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  periodo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  importe: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seguro: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  dias_estancia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  incidencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fec_incidencia: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  por_importe: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  por_antiguedad: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  inc_actual: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resultado: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'coin',
  timestamps: false,
});

export default Coin;
