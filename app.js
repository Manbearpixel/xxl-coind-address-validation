const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const coindApi      = require('xxl-coind-express-api');
const validationApi = require('./routes/api');
const settings      = require('./config/');
const db            = require('./lib/database');
const debug         = require('debug')('xxl:coind:validator:app');

// Create Express App
let app = express();

// Set App Port
app.set('port', process.env.PORT || settings.port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup xxl-coind-express middleware
let allowedMethods = ['verifymessage'];
let walletSettings = settings.wallet;
 
// Provide an array of allowed RPC methods
// Provide local *coind wallet settings
// Bind the middleware "coindApi" to a provided path
app.set('coindAllowedMethods', allowedMethods);
app.set('coindRPCSettings', walletSettings); 
app.use('/blockchain', coindApi);

app.get('/', (req, res, next) => {
  if (req.cookies.hasOwnProperty('validationId')) return res.redirect('/dashboard');
  res.render('index', { title: 'Validator | Home' });
});

app.get('/logout', (req, res, next) => {
  res.clearCookie('validationId');
  res.redirect('/');
});

app.get('/search', (req, res, next) => {
  res.render('search', { title: 'Validator | Search' });
});

app.post('/search', (req, res, next) => {
  if (req.body.requestId) {
    debug(`Search for #${rew.body.requestId}`);

    db.get_validation(req.body.requestId)
    .then((validation) => {
      console.log('validation', validation);
      res.cookie('validationId', req.body.requestId);
      res.redirect('dashboard');
    })
    .catch((err) => {
      err = (err.message) ? err.message : err;
      res.render('search', { error: err });
    });
  }
  else {
    res.render('create', { error: 'No address provided' });
  }
});

app.get('/create', (req, res, next) => {
  res.render('create', { title: 'Admin' });
});

app.post('/create', (req, res, next) => {
  res.clearCookie('validationId');

  debug(`Create validation request for ${req.body.address}`);

  if (req.body.address) {
    db.create_validation(req.body.address)
    .then((validation) => {
      if (validation) {
        res.cookie('validationId', validation);
        res.redirect('dashboard');
      }
      else
        res.render('create', { error: 'Standard Error' });
    })
    .catch((err) => {
      err = (err.message) ? err.message : err;
      res.render('create', { error: err });
    });
  }
  else {
    res.render('create', { error: 'No address provided' });
  }
});

app.get('/dashboard', (req, res, next) => {
  if (!req.cookies.hasOwnProperty('validationId')) return res.redirect('/');
  db.get_validation(req.cookies.validationId)
  .then((validation) => {
    res.render('dashboard', { validationId: req.cookies.validationId, validation: validation });
  })
  .catch((err) => {
    err = (err.message) ? err.message : err;
    res.render('create', { error: err });
  });
  //XDFSNv9mhpgr3LyXCFpthDdpshogHic63a
});

app.post('/dashboard', (req, res, next) => {
  console.log(req.body);

  if (req.cookies.hasOwnProperty('validationId') && req.body.signed) {
    db.get_validation(req.cookies.validationId)
    .then((validation) => {
      console.log(validation);
      const validator = require('./lib/validator');
      validator.validate(validation.address, req.body.signed, validation.verification)
      .then((valid) => {
        console.log('VALID?', valid);
        db.set_validation_status(req.cookies.validationId, 'verified')
        .then(() => res.redirect('/dashboard'))
        .catch(() => res.redirect('/dashboard'))
      })
      .catch((err) => {
        err = (err.message) ? err.message : err;
        res.render('dashboard', { validationId: req.cookies.validationId, validation: validation, error: `Verification Rejected. Invalid Signature!` });
      })
    })
    .catch((err) => {
      err = (err.message) ? err.message : err;
      res.render('/', { error: err });
    });
  }
  else {
    res.redirect('/dashboard');
  }
});


// Bind api middleware to path
app.use('/api', validationApi);

/**
 * Edge Case, missing route
 */
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      status: 'error',
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
    error: err
  });
});

module.exports = app;
