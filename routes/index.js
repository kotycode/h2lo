//Konfiguracja sciezek w odzielnym pliku
//Odwolanie do ruter dostepny w express.
//Import express.js
const express = require('express');
//Przypisanie ruter do stalej o tej samej nazwie
const router = express.Router();

const PagesController = require('../controllers/PagesController');

const ApplicationController = require('../controllers/ApplicationsController');


router.get('/', PagesController.home);
router.get('/measurement', PagesController.measurement);

router.post('/applications', ApplicationController.store);

//Przypisanie ruter do obiektu model export
module.exports = router;