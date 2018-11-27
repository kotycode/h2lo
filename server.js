//Import pliku app.js
const app = require('./app');

//Nasluchiwanie poprzez zmiennych srodowiskowych / alternatywa 8080
app.set('port', process.env.PORT || 8888);

//Ustawianie nasluchiwania pobieranie zmiennej port i ustawienie callback wywolany w momencie rozpoczecia nasluchiwania
//const server = app.listen(app.get('port'), () => {
//  console.log('Listening on ${ server.address().port }');
// });

const server = app.listen(app.get('port'), function() {
    console.log('listening on ' + server.address().port);
});
