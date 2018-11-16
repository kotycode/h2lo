//Import modulu express za pomoca f.require
const express = require('express');
//Import modulu PATH
const path = require('path');
//Bodyparser i cookieparser
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//Modul conect flash
const flash = require('connect-flash');
//Importowanie pliku index.js
const routes = require('./routes/index');

const session = require('express-session');

const consolidate = require('consolidate');

//Nowa instancja aplikacji
const app = express();


app.engine('html', consolidate.swig);
//Renderowanie widokow oraz obsluga statycznych plikow
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//Serwowanie plikow statycznych
app.use(express.static(path.join(__dirname, 'public')));

//Metoda use instancji naszej aplikacji odczytywanie danych za pomoca formularzy + obsluga ciasteczek
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());



//Konfiguracja flash
app.use(flash());

//Obsluga wszystkich zapytan zaczynajacych sie od slash
//Wyexportowane sciezki do zew. pliku
app.use('/', routes);

//Dodanie instancji do obiektu exports
module.exports = app;
