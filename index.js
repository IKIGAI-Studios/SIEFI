import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import main_routes from './routes/main_routes.js';
import socketConnection from './sockets/sockets.js';
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
socketConnection(io); // Configura los sockets en el servidor


httpServer.listen(port, () => {
    console.log(`Server in port ${port}`);
});

app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', main_routes);
app.use("/img", express.static(path.join(__dirname, 'src/img')));
app.use("/fonts", express.static(path.join(__dirname, 'src/fonts')));
app.use("/js", express.static(path.join(__dirname, 'src/js')));
app.set('view engine', 'ejs');
app.use("/scss", express.static(path.join(__dirname, 'src/assets/scss')));