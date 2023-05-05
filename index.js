const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const main_routes = require('./routes/main_routes');

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
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', main_routes);
app.use("/img", express.static(path.join(__dirname, 'src/img')));
app.use("/fonts", express.static(path.join(__dirname, 'src/fonts')));
app.use("/js", express.static(path.join(__dirname, 'src/js')));
app.set('view engine', 'ejs');
app.use("/scss", express.static(path.join(__dirname, 'src/assets/scss')));



const port = 3000;
app.listen(port, () => {
    console.log(`Server in port ${port}`);
});