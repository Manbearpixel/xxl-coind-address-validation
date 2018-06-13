/**
 * Libraries
 */
const request     = require('request');
const debug       = require('debug')('xxl:coind:validator:lib:validator');
const settings    = require('../config/');

function rejectMessage(uri, error, response, body) {
  let errMsg      = '';
  let statusCode  = 'xxx';
  if (typeof body === 'object' && body.message) errMsg = body.message;
  else if (error && error.message) errMsg = error.message;
  if (typeof response === 'object' && response.statusCode) statusCode = response.statusCode;
  console.log(`coind::validator Server connection issue! url: ${uri}\nerror code:\t${statusCode}\nerror msg:\t${errMsg}\n`);
  return errMsg;
}

// run an asynchronous request to the local coind blockchain api
async function apiRequest(apiMethod, params) {
  
  if (typeof params === 'undefined') params = {};
  return new Promise((res, rej) => {
    let uri = `${settings.hostUrl}:${settings.port}/${apiMethod}`;
    request({ uri: uri, json: true, qs: params }, (error, response, body) => {
      debug('API', {
        error:    (error) ? error.message : '',
        response: (response) ? response.statusCode : '',
        body: body
      });
      if (error || response.statusCode !== 200) return rej(rejectMessage(uri, error, response, body));
      res(body);
    });
  });
}

module.exports = {
  validate: (address, signed, message) => {
    return new Promise((res, rej) => {
      let params = { address: address, signed: signed, message: message };
      debug('validate request', params);

      apiRequest('blockchain/verifymessage', params)
      .then((body) => {
        if (body === true || body === 'true') return res(true);
        return rej(false);
      })
      .catch((err) => {
        console.log('coind::validator err', err);
        rej(err);
      });
    });
  }
};
