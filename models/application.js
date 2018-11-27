const bookshelf = require('../config/bookshelf');

const Application = bookshelf.Model.extend({
    tableName: 'pressure'
});

module.exports.create = (application) => {
    return new Application({
        id: application.Id,
        systolic: application.systolic,
        diastolic: application.diastolic,
        pulse: application.pulse || null,
        data_time: application.data_time,
        comment: application.comment
    }).save();
};