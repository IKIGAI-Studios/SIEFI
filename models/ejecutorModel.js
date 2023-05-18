import { DataTypes } from "sequelize";
import sequelize from "../database.js" ;

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

export default Ejecutor;
