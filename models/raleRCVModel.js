import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const RaleRcv = sequelize.define('rale_rcv', {
  reg_pat: {
    type: DataTypes.STRING(12),
    allowNull: false,
    primaryKey: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  mov: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  patronal: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sect: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nom_cred: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  ce: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  periodo: {
    type: DataTypes.DATE,
    allowNull: false
  },
  td: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fec_alta: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fec_notif: {
    type: DataTypes.DATE,
    allowNull: false
  },
  inc: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fec_insid: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dias: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  importe: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  dcsc: {
    type: DataTypes.INTEGER,
    allowNull: false
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
    allowNull: false
  },
  gastos_ejecutor: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  fol_sua: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  res_dil: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cobrado_patron: {
    type: DataTypes.INTEGER(100),
    allowNull: true
  },  
  gatos_ejecutor: {
    type: DataTypes.INTEGER(100),
    allowNull: true
  }, 
  citatorio: {
    type: DataTypes.STRING(2),
    allowNull: true
  }
}, {
  tableName: 'rale_rcv',
  timestamps: true,
  engine: 'InnoDB',
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

export default RaleRcv;