// akcje obslugujace kontkretne podstrony
exports.home = (req, res) => {
    res.render('home');
    console.log('Home page open');
};

exports.next = (req, res) => {
    res.render('next');
    console.log('next page open');
};
