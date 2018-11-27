// zapisywanie zgloeszen uzytkownikow
const Application = require('../models/application');

exports.store = (req, res) => {
    
    const application = Application.create({
        'id': req.body.id,
        'systolic': req.body.systolic,
        'diastolic': req.body.diastolic,
        'pulse': req.body.pulse,
        'data_time': req.body.data_time,
        'comment': req.body.comment
    }).then(function() {
        res.redirect('/');
        console.log('Dane zapisano do bazy');
    });
};