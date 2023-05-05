const routes = require('express').Router();
const bcrypt = require('bcrypt');
const Ejecutor = require('../models/ejecutorModel');

routes.get('/login', (req, res) => {
    res.render('login', { session: req.session });
});

routes.get('/registerEjecutor', (req, res) => {
    res.render('registerEjecutor', { session: req.session });
    req.session.registerEjecutor = '';
});

routes.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar el usuario
        const user = await Ejecutor.findOne({
            where: {
                user: username
            },
            attributes: ['pass', 'type', 'status']
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

        // Redireccionar al tipo de usuario
        if (user.type == "ejecutor") {
            res.json('Ejecutor')
        } else {
            res.json('Administrador')
        }
    } catch (error) {
        // Regresar un mensaje de error
        req.session.loginError = 'Error al hacer la consulta';
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
        req.session.registerEjecutor = 'No se pudo registrar el ultimo Ejecutor';
        res.redirect('/registerEjecutor');
    }
});
  
module.exports = routes;