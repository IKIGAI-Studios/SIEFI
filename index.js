import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import main_routes from './routes/main_routes.js';
//import socketConnection from './sockets/sockets.js';
import { socket as loadInfoSockets } from './sockets/loadInfoSockets.js';
import { socket as estIndividualesSockets } from './sockets/estindividualesSockets.js';
import { socket as actEjecutorSockets } from './sockets/actEjecutorSockets.js';
import http from 'http';
import { Server } from 'socket.io'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(session({
  secret: process.env.SECRET_KEY_SESSION,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }, 
}));

const port = 3000;
const httpServer = http.createServer(app); // Crea un servidor HTTP con Express
const io = new Server(httpServer);

loadInfoSockets(io); // Configura los sockets de load Info en el servidor
estIndividualesSockets(io); // Configura los sockets de estadisticas individuales en el servidor
actEjecutorSockets(io); // Configura los sockets de actualizar ejecutor en el servidor


httpServer.listen(port, () => {
    console.log(`Server in port ${port}`);
});

app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', main_routes);
app.use("/scss", express.static(join(__dirname, 'src/assets/scss')));
app.use("/icons", express.static(join(__dirname, 'src/icons')));
app.use("/imgs", express.static(join(__dirname, 'src/imgs')));
app.use("/fonts", express.static(join(__dirname, 'src/fonts')));
app.use("/js", express.static(join(__dirname, 'src/js')));
app.set('view engine', 'ejs');
