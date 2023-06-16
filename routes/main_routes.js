import express from 'express';
import bcrypt from 'bcrypt';
import Ejecutor from '../models/ejecutorModel.js';
import Afil63 from '../models/afilModel.js';
import {Op} from 'sequelize';
import sequelize from '../database.js';
import RaleCop from '../models/raleCOPModel.js';
import RaleRcv from '../models/raleRCVModel.js';
import path from 'path';
import { generarInforme, generarGastos } from './funciones_main_routes.js';


const routes = express.Router();

routes.get('/login', (req, res) => {
    res.render('login', { session: req.session });
});

routes.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/login');
        }
    });
});

routes.get('/registerEjecutor', (req, res) => {
    // No existe la sesión
    // if (req.session.user === undefined) {
    //     res.redirect('/login');
    //     return;
    // }

    // // No es administrador
    // if (req.session.user.tipo_usuario != 'admin') {
    //     res.redirect('/login');
    //     return;
    // }

    res.render('registerEjecutor', { session: req.session });
    req.session.registerEjecutor = '';
});

routes.get('/confronta', async (req, res) => {
    // No existe la sesión
    // if (req.session.user === undefined) {
    //     res.redirect('/login');
    //     return;
    // }

    // // No es administrador
    // if (req.session.user.tipo_usuario != 'admin') {
    //     res.redirect('/login');
    //     return;
    // }

    try {
        const ejecutores = await Ejecutor.findAll({
            where : { type : 'ejecutor', status: '1' }
        });
        res.render('confronta', { session: req.session, ejecutores });
    } catch (e) {
        res.json(e)
    }
});

routes.get('/loadInfo', (req, res) => {
    res.render('loadInfo', { session: req.session });
});

routes.get('/actualizarEjecutor', async (req, res) => {
    try{
        const ejecutores = await Ejecutor.findAll();
        const afil = await Afil63.findAll();
        res.render('actualizarEjecutor', { session: req.session, ejecutores, afil });
        req.session.actualizarEjecutor = '';
    } catch(error){
        console.log(error);
    }
});

routes.get('/registrarAfil', async (req, res) => {
    try{
        const usuEjecutores = await Ejecutor.findAll({where: {type : 'ejecutor', status:'1'}});
        res.render('registrarAfil', { session: req.session, usuEjecutores });
        req.session.registrarAfil = '';
    } catch(error){
        console.log(error);
    }
});

routes.get('/estadisticasIndividuales', async (req, res) => {
    try{
        const ejecutores = await Ejecutor.findAll({
            where : { type : 'ejecutor', status: '1' }
        });
        res.render('estindividuales', { session: req.session, ejecutores });
        req.session.actualizarEjecutor = '';
    } catch(error){
        console.log(error);
    }
});

routes.get('/estadisticasGlobales', async (req, res) => {
    try{
        const ejecutores = await Ejecutor.findAll({
            where : { type : 'ejecutor', status: '1' }
        });
        res.render('estGlobales', { session: req.session, ejecutores });
        req.session.actualizarEjecutor = '';
    } catch(error){
        console.log(error);
    }
});

routes.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar el usuario
        const user = await Ejecutor.findOne({
            where: {
                user: username
            },
            attributes: ['clave_eje', 'nombre', 'pass', 'type', 'status']
        });

        // No existe el usuario
        if (!user) {
            req.session.loginError = 'Usuario no encontrado';
            res.redirect('/login');
            return;
        }

        // Existe pero esta deshabilitado
        if (!user.status) {
            req.session.loginError = 'Usuario deshabilitado';
            res.redirect('/login');
            return;
        }

        // Encriptar contraseña para comparar
        const passwordMatch = await bcrypt.compare(password, user.pass);

        if (!passwordMatch) {
            req.session.loginError = 'Contraseña incorrecta';
            res.redirect('/login');
            return;
        }

        let nombre, apellidos, arrNombre = user.nombre.split(" ");
        if (arrNombre[3]) {
            nombre = arrNombre[0] + " " + [1];
            apellidos = arrNombre[2] + " " + [3];
        } else {
            nombre = arrNombre[0];
            apellidos = arrNombre[1] + " " + arrNombre[2];
        }
        
        // Crear la sesión del Usuario
        req.session.user = { nombre , apellidos, clave_eje: user.clave_eje, tipo_usuario: user.type };

        // Redireccionar al tipo de usuario
        if (user.type == "ejecutor") {
            console.log(req.session.user)
            res.redirect('/reportes');
        } else {
            res.redirect('/loadInfo');
        }
    } catch (error) {
        // Regresar un mensaje de error
        req.session.loginError = `Error al hacer la consulta | Error: ${error}`;
        res.redirect('/login');
    }
});

routes.post('/registerEjecutor', async (req, res) => {
    try {
        const { clave_eje, nombre, user, pass, type } = req.body;
        
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);
        
        // Validar que el usuario sea unico
        const existingUser = await Ejecutor.findOne({ where: { user } });
        if (existingUser) {
            req.session.registerEjecutor = `El usuario ${user} ya ha sido registrado`;
            res.redirect('/registerEjecutor');
            return;
        }

        // Validar que la clave sea unica
        const existingClave = await Ejecutor.findOne({ where: { clave_eje } });
        if (existingClave) {
            req.session.registerEjecutor = `La clave ${clave_eje} ya ha sido registrada`;
            res.redirect('/registerEjecutor');
            return;
        }
        
        // Registrar el usuario
        const newEjecutor = await Ejecutor.create({
            clave_eje,
            nombre,
            user,
            pass: hashedPassword,
            type,
            status: 1
        });

        // Regresar un mensaje de confirmación
        req.session.registerEjecutor = `${nombre} Registrado Correctamente`;
        res.redirect('/registerEjecutor');
    } catch (error) {
        // Regresar un mensaje de error
        req.session.registerEjecutor = `No se pudo registrar el ultimo Ejecutor | Error: ${error}`;
        res.redirect('/registerEjecutor');
    }
});

    
routes.post('/actualizarEjecutor', async (req, res) =>{
    try{
        const { clave_eje, nombre, status, user, type } = req.body;
        
        //No ha seleccionado la clave del ejecutor. 
        if (clave_eje == ''){
            req.session.actualizarEjecutor = 'Favor de elegir la clave del ejecutor.';
            res.redirect('/actualizarEjecutor');
            return;
        }

        // Alguno de los campos no fue llenado
        if (nombre == '' || status =='' || user=='' || type == ''){
            req.session.actualizarEjecutor = 'Favor de llenar todos los campos';
            res.redirect('/actualizarEjecutor');
            return;
        }

        const actualizarEjecutor = await Ejecutor.update({nombre : nombre, status : status, user : user, type : type}, {where: {clave_eje : clave_eje}});
        req.session.actualizarEjecutor = 'Usuario actualizado correctamente';
        res.redirect('/actualizarEjecutor');
    
    }catch(error){
        console.log("Error ", error);
        req.session.actualizarEjecutor = 'Error en la actualización del usuario';
        res.redirect('/actualizarEjecutor');
    }
})

routes.post('/loadCoin', async (req, res) => {
    try {
        res.json(req.body)
    } catch (error) {
        // Regresar un mensaje de error
        // req.session.loginError = `Error al hacer la consulta | Error: ${error}`;
        res.json(error);
    }
});

routes.post('/registrarAfil', async (req, res) => {
    try {
        const { reg_pat, patron, actividad, domicilio, localidad, rfc, cp, ejecutor, clave_eje } = req.body;

        // Todos los campos no son llenados 
        if(reg_pat == '' || patron == '' || actividad == '' || domicilio =='' || localidad == '' ||  cp == '' || ejecutor == '' || clave_eje =='' ){
            req.session.registrarAfil = 'Todos los campos no han sido llenados';
            res.redirect('/registrarAfil');
            return;
        }

        //Los campos de RFC y CP no cumplen la longitud
        if(rfc == ''){
            req.session.registrarAfil = 'Ingresa un RFC válido';
            res.redirect('/registrarAfil');
            return;
        }

        // Registrar el afil
        const newAfil = await Afil63.create({ reg_pat, patron, actividad, domicilio, localidad, rfc, cp, ejecutor, clave_eje  });

        // Regresar un mensaje de confirmación
        req.session.registrarAfil = `Registrado Correctamente`;
        res.redirect('/registrarAfil');
    } catch (error) {
        // Regresar un mensaje de error
        req.session.registrarAfil = `No se pudo registrar el ultimo Afil | Error: ${error}`;
        res.redirect('/registrarAfil');
    }
});


routes.post('/desasignarPatrones', async (req, res) => {
    try {  

        const registros_patA = req.body.patronesA;

        if (typeof registros_patA == 'string') {
            await Afil63.update(
                { ejecutor: 'foraneo', clave_eje: 'E-00000000' },
                { where: { reg_pat: registros_patA } }
              )
              .then(() =>{
                  console.log('Actualizado correctamente');
              })
              .catch(() => {
                  console.log('Error al actualizar');
              });

              res.redirect('/actualizarEjecutor');
        } else {
            registros_patA.map((reg) => {
                  Afil63.update(
                    { ejecutor: 'foraneo', clave_eje: 'E-00000000' },
                    { where: { reg_pat: reg } }
                  )
                  .then(() =>{
                      console.log('Actualizado correctamente');
                  })
                  .catch(() => {
                      console.log('Error al actualizar');
                  });
    
                  res.redirect('/actualizarEjecutor');
            });
        }
  
    } catch (error) {
      console.log(error);
    }
  });
  


routes.post('/asignarPatrones' , async (req, res) =>{ 
    try {  

        const registros_patNA = req.body.patronesNA;
        const clave_eje = req.body.claveEje;
        const ejecutor = req.body.nomEje;

        if (typeof registros_patNA == 'string') {
            await Afil63.update(
                { ejecutor: ejecutor, clave_eje: clave_eje },
                { where: { reg_pat: registros_patNA } }
              )
              .then(() =>{
                  console.log('Actualizado correctamente');
              })
              .catch(() => {
                  console.log('Error al actualizar');
              });

              res.redirect('/actualizarEjecutor');
        } else {
            registros_patNA.map((reg) => {
                  Afil63.update(
                    { ejecutor: ejecutor, clave_eje: clave_eje },
                    { where: { reg_pat: reg } }
                  )
                  .then(() =>{
                      console.log('Actualizado correctamente');
                  })
                  .catch(() => {
                      console.log('Error al actualizar');
                  });
    
                  res.redirect('/actualizarEjecutor');
            });
        }
  
    } catch (error) {
      console.log(error);
    }
    
});

routes.post('/elimarAfilFiltrado', async(req, res) =>{
    try {
        const fechaAfil = req.body.selectAfil;

        const eliminarAfilF = await Afil63.destroy({
            where: sequelize.where(
                sequelize.fn('DATE', sequelize.col('createdAt')),
                fechaAfil
              )
        });

        res.redirect('/loadInfo');
        console.log('Eliminado correctamente');

    } catch(error) {
        console.log('Error al eliminar el Afil',error);
        res.redirect('/loadInfo');
    }
});

routes.post('/elimarCoinFiltrado', async(req, res) =>{
    try {
        const fechaCoin = req.body.selectCoin;

        const eliminarCoinF = await Coin.destroy({
            where: sequelize.where(
                sequelize.fn('DATE', sequelize.col('createdAt')),
                fechaCoin
              )
        });

        res.render('loadInfo', { session: req.session});
        req.session.loadInfo = 'Registros eliminados exitosamente';

    } catch(error) {
        console.log('Error al eliminar el Coin',error);
        res.redirect('/loadInfo');
    }
});

routes.post('/elimarRaleCOPFiltrado', async(req, res) =>{
    try {
        const fechaRaleCOP = req.body.selectRaleCOP;

        const eliminarRaleCOPF = await RaleCop.destroy({
            where: sequelize.where(
                sequelize.fn('DATE', sequelize.col('createdAt')),
                fechaRaleCOP
              )
        });

        res.render('loadInfo', { session: req.session});
        req.session.loadInfo = 'Registros eliminados exitosamente';

    } catch(error) {
        console.log('Error al eliminar el Rale COP',error);
        res.redirect('/loadInfo');
    }
});

routes.post('/elimarRaleRCVFiltrado', async(req, res) =>{
    try {
        const fechaRaleRCV = req.body.selectRaleRCV;

        const eliminarRaleRCVF = await RaleRcv.destroy({
            where: sequelize.where(
                sequelize.fn('DATE', sequelize.col('createdAt')),
                fechaRaleRCV
              )
        });

        res.render('loadInfo', { session: req.session});
        req.session.loadInfo = 'Registros eliminados exitosamente';

    } catch(error) {
        console.log('Error al eliminar el Rale RCV',error);
        res.redirect('/loadInfo');
    }
});


//Rutas para reportes

routes.get('/reportes', (req, res) => {
    console.log(req.session.user, )
    // No existe la sesión
    if (req.session.user === undefined) {
        res.redirect('/login');
        return;
    }

    // No es administrador
    if (req.session.user.tipo_usuario != 'ejecutor') {
        res.redirect('/login');
        return;
    }
    res.render('reportes', { session: req.session });
});


routes.post('/generarCitatorio', (req, res) => {
    console.log("Citatorio: ",req.body);
});


routes.post('/generarMandamiento', (req, res) => {
    console.log("Mandamiento:", req.body);
});



routes.post('/generarInforme', async (req, res) => {
    try {
        await generarInforme(req,res);
      } catch (error) {
        console.error(error);
      }    
}); 
  

routes.post('/generarGastos', async (req, res) => {
    try {
        await generarGastos(req,res);
      } catch (error) {
        console.error(error);
      }       
});


export default routes;