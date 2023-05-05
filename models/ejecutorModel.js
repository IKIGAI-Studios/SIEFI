const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Ejecutor = sequelize.define(
  "ejecutor",
  {
    clave_eje: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    rfc: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    cp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    pass: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "ejecutor",
  }
);

module.exports = Ejecutor;
