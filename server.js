const mongoose  = require('mongoose');
const settings  = require('./config/');
const db        = require('./lib/database');
const app       = require('./app');
const debug     = require('debug')('xxl:coind:validator:server');

let dbString = 'mongodb://' + encodeURIComponent(settings.dbsettings.user);
dbString = dbString + ':' + encodeURIComponent(settings.dbsettings.password);
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

// exit this process with optional reason
function exit(reason) {
  if (reason) console.log(`[coind-address-validation] Exiting ... ${reason}`);
  mongoose.disconnect();
  process.exit(0);
}

// Catch signal end
// Clean up lock, disconnect from mongoose, then exit
process.on('SIGINT', function() {
  debug('Caught signal-termination! -- Shutting down\n');
  exit();
});

db.connect(dbString)
.then(() => {
  let server = app.listen(app.get('port'), () => {
    debug('Address Verification Server listening on port ' + server.address().port);
  });
})
.catch(exit);
