import Afil from "../models/afilModel.js";
import RaleCop from "../models/raleCOPModel.js";
import RaleRCV from "../models/raleRCVModel.js";
import Sequelize from "../database.js";
import { Op } from 'sequelize';
import Ejecutor from "../models/ejecutorModel.js";

export function socket(io) {
  io.on("connection", (socket) => {



//Obtener las fechas de las tablas RCV y COP de los registros que estan asignados al ejecutor. 
socket.on('cliente:capturarDatos', async (value, clave_eje) => {

  // Obtener de la tabla Afil los registros que están en la tabla ejecutores.
  const reg_pat = await Afil.findAll({
    where: { clave_eje: clave_eje }
  });

  // Obtener de las fechas de los registros de Rale Cop
  const fechasCOP = await RaleCop.findAll({
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('createdAt')), 'createdAt']],
    raw: true
  });

  // Obtener de las fechas de los registros de Rale RCV
  const fechasRCV = await RaleRCV.findAll({
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('createdAt')), 'createdAt']],
    raw: true
  });

  // Extraer las fechas del resultado de RaleCop
  const fechasCOPArray = fechasCOP.map(item => item.createdAt);

  // Extraer las fechas del resultado de RaleRCV
  const fechasRCVArray = fechasRCV.map(item => item.createdAt);

  // Unir los arreglos de fechas en una sola variable llamada fechas
  const fechas = fechasCOPArray.concat(fechasRCVArray);
  socket.emit('servidor:capturarDatos', fechas, value, clave_eje);
});



// Obtener patrones y las fechas en las que se subio para mandamiento y citatorio
socket.on('cliente:obtenerPatrones', async (patron, fecha, value, clave_eje) => {
  
  // Obtener de la tabla Afil los registros que están en la tabla ejecutores.
  const reg_pat = await Afil.findAll({
    where: { clave_eje: clave_eje}
  });

  // Obtener de la tabla Rale COP los registros que coincidan con la consulta anterior.
  const raleC = await RaleCop.findAll({
    attributes: ['reg_pat', 'nom_cred', 'periodo', 'importe', 'td', 'inc', 'createdAt'],
    where: { 
            reg_pat: reg_pat.map(rp => rp.reg_pat), 
            reg_pat: patron,
            createdAt: { 
                [Op.eq]: Sequelize.literal(`DATE('${fecha}')`)
              }  
            }
    });

  // Obtener de la tabla Rale RCV los registros que coincidan con la consulta anterior.
  const raleR = await RaleRCV.findAll({
    attributes: ['reg_pat', 'nom_cred', 'periodo', 'importe', 'td', 'inc', 'createdAt'],
    where: { 
            reg_pat: reg_pat.map(rp => rp.reg_pat), 
            reg_pat: patron,
            createdAt: { 
                [Op.eq]: Sequelize.literal(`DATE('${fecha}')`)
                } 
              }
    });

    // Agregar la propiedad 'type' a cada objeto en raleCop y raleRCV
    const raleCop = raleC.map(obj => ({ ...obj.dataValues, type: 'cop' }));
    const raleRCV = raleR.map(obj => ({ ...obj.dataValues, type: 'rcv' }));

    // Unir las variables raleCop y raleRCV en una sola variable llamada patrones
    const patrones = raleCop.concat(raleRCV);

    socket.emit('servidor:obtenerPatrones', patrones, value, clave_eje);

});



// Obtener patrones y las fechas en las que se subio para gastos e informes de ejecutor
socket.on('cliente:obtenerPatronesEjecutor', async (value, clave_eje) => {
  
  // Obtener de la tabla Afil los registros que están en la tabla ejecutores.
  const reg_pat = await Afil.findAll({
    where: { clave_eje: clave_eje}
  });

  // Obtener de la tabla Rale COP los registros que coincidan con la consulta anterior.
  const raleC = await RaleCop.findAll({
    attributes: ['reg_pat', 'nom_cred', 'periodo', 'importe', 'td', 'inc', 'createdAt', 'cobrado'],
    where: { reg_pat: reg_pat.map(rp => rp.reg_pat)}
  });

  // Obtener de la tabla Rale RCV los registros que coincidan con la consulta anterior.
  const raleR = await RaleRCV.findAll({
    attributes: ['reg_pat', 'nom_cred', 'periodo', 'importe', 'td', 'createdAt', 'inc', 'cobrado'],
    where: { reg_pat: reg_pat.map(rp => rp.reg_pat)}
  });

  // Agregar la propiedad 'type' a cada objeto en raleCop y raleRCV
  const raleCop = raleC.map(obj => ({ ...obj.dataValues, type: 'cop' }));
  const raleRCV = raleR.map(obj => ({ ...obj.dataValues, type: 'rcv' }));

  // Unir las variables raleCop y raleRCV en una sola variable llamada patrones
  const patrones = raleCop.concat(raleRCV);

  socket.emit('servidor:obtenerPatrones', patrones, value, clave_eje);
});


// Obtener el registro patronal de las opciones seleccionadas
socket.on('cliente:crearFormInforme', async (data, value, user) => {
  var dataM;
  if (value == 'informe'){
    //Obtener sólo los datos que se van a utilizar en la tabla
      dataM = data.map(obj => {
      return {
        reg_pat: obj.reg_pat,
        type: obj.type,
        nom_cred: obj.nom_cred,
        periodo: obj.periodo,
        importe: obj.importe
      };
    });

  } else if (value === 'gastos') {

    // Obtener sólo los datos que se van a utilizar en la tabla
      dataM = await Promise.all(data.map(async (obj) => {
      const afilData = await Afil.findOne({
        attributes: ['patron'],
        where: {
          reg_pat: obj.reg_pat
        }
      });
      
      return {
        reg_pat: obj.reg_pat,
        patron: afilData.patron, // Agregar el campo "nombre" obtenido de la tabla Afil
        type: obj.type,
        nom_cred: obj.nom_cred,
        periodo: obj.periodo
      };
    }));
  }
  
  const regEjecutor = await Ejecutor.findOne({
    attributes: ['clave_eje', 'nombre'],
    where: { clave_eje: user }
  });

  socket.emit('servidor:crearFormInforme', dataM, value, user, regEjecutor);
});



    // Maneja el evento de desconexión del cliente
    socket.on("disconnect", () => {
      // Programar eventos (innecesarios por ahora)
    });
  });
}