import express from 'express';
import bcrypt from 'bcrypt';
import Ejecutor from '../models/ejecutorModel.js';

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
    // if (req.session.user.tipo != 'admin') {
    //     res.redirect('/login');
    //     return;
    // }

    res.render('registerEjecutor', { session: req.session });
    req.session.registerEjecutor = '';
});

routes.get('/loadInfo', (req, res) => {
    res.render('loadInfo', { session: req.session });
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

        // Crear la sesión del Usuario
        req.session.user = { nombre: user.nombre, clave_eje: user.clave_eje, tipo: user.type };

        // Redireccionar al tipo de usuario
        if (user.type == "ejecutor") {
            console.log(req.session.user)
            res.json('Ejecutor')
        } else {
            res.redirect('/registerEjecutor');
        }
    } catch (error) {
        // Regresar un mensaje de error
        req.session.loginError = `Error al hacer la consulta | Error: ${error}`;
        res.redirect('/login');
    }
});

routes.post('/registerEjecutor', async (req, res) => {
    try {
        const { clave_eje, nombre, rfc, cp, user, pass, type } = req.body;
        
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
            rfc,
            cp,
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
  
export default routes;