import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false // Establecer a false para desactivar los mensajes de sequelize
});

sequelize.sync({force:false})
.then(() => {
    console.info("Connected to MYSQL");
})
.catch((e) => {
    console.error(`Error: ${e}`);
});

export default sequelize;
