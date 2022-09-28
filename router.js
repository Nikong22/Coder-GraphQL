
function getLogin(req, res) {
    if (req.isAuthenticated()) {
        let user = req.user;
        console.log('Usuario logueado');
        res.json(user);
    } else {
        console.log('Usuario no logueado');
        res.redirect('/');
    }
}

function postLogin(req, res) {
    let user = req.user;
    user.visitas++;
    res.redirect('/datos');
}

function getFailLogin(req, res) {
    res.redirect('/error-login.html');
}

function getSignUp(req, res) {
    res.redirect('/register.html');
}

function postSignUp(req, res) {
    res.redirect('/datos');
}

function getFailSignUp(req, res) {
    res.redirect('/error-signup.html');
}

function getLogout(req, res) {
    req.logout(function (err) {
        console.log('logout1')
        if (err) { return next(err); }
        res.cookie('username', '');
        console.log('logout2')
        res.redirect('/');
    });
}

function failRoute(req, res) {
    res.status(404).send('Ruta no encontrada');
}

function getRutaProtegida(req, res) {
    res.send('<h1>Pude ingresar a la ruta protegida</h1>');
}

function getDatos(req, res) {
    console.log('getDatos');
    if (req.isAuthenticated()) {
        console.log('entra al if');
        let user = req.user;
        console.log(user);
        res.cookie('username', user.username, { signed: false, maxAge: 5000 });
        /*res.json({
            id: user._id,
            usuario: user.username,
            direccion: user.direccion,
            visitas: user.visitas
        });*/
        res.redirect('/index.html');
    } else {
        res.redirect('/index.html');
    }
}

module.exports = {
    getLogin,
    postLogin,
    getFailLogin,
    getSignUp,
    postSignUp,
    getFailSignUp,
    getLogout,
    getRutaProtegida,
    getDatos,
    failRoute
}