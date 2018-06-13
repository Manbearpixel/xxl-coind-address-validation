/**
 * Libraries
 */
const mongoose    = require('mongoose');
const crypto      = require('crypto');
const randomWords = require('random-words');
const moment      = require('moment');
const debug       = require('debug')('xxl:coind:validator:lib:database');
const settings    = require('../config/');
const uuid        = require('./uuid');

/**
 * Models
 */
const Validation  = require('../models/validation');

// Generate a shortened base64 hash of a random id
function createRequestId() {
  let uid = uuid.generate();
  let sha = crypto.createHash('sha1');
  sha.update(uid);
  return sha.digest('base64').substr(0, 10);
}

module.exports = {
  // initialize DB
  connect: async function(database) {
    return new Promise((res, rej) => {
      mongoose.connect(database, (err) => (err) ? rej(err) : res(true));
    });
  },

  create_validation(address) {
    return new Promise((res, rej) => {
      let word  = randomWords();
      let reqId = createRequestId();

      if (address === '' || address.length != 34) return rej('Invalid Address');

      let data = {
        id:           reqId,
        word:         word,
        status:       'unverified',
        created_at:   moment().utc(),
        address:      address,
        verification: word
      };
  
      let newValidation = new Validation(data);
      newValidation.save((err) => {
        if (err) return rej(err);
        return res(reqId);
      });
    });
  },

  get_validation(validationId) {
    return new Promise((res, rej) => {
      if (validationId === '') return rej('Invalid Validation ID');

      debug(`grab validation request for #${validationId}`);
      Validation.findOne({ id: validationId }, (err, request) => (err || !request) ? rej('Validation request not found') : res(request));
    });
  },

  set_validation_status(validationId, status) {
    return new Promise((res, rej) => {
      if (validationId === '') return rej('Invalid Validation ID');

      debug(`validation status update [${status}] #${validationId}`);
      Validation.update({ id: validationId }, {
        status: status,
        confirmed_at: moment().utc()
      }, (err) => {
        if (err) {
          console.log('coind::validation Status Update ERR', err);
          return rej(err);
        }
        return res();
      });
    });
  }
};
