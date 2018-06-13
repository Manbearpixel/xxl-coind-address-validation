const express     = require('express');
const request     = require('request');
const settings    = require('../config/');
const validator   = require('../lib/validator');
const router      = express.Router();

const base_url = `http://127.0.0.1:${settings.port}`;

// run an asynchronous request to the local coind blockchain api
async function apiRequest(apiMethod, params) {
  function rejectMessage(uri, error, response, body) {
    let errMsg      = '';
    let statusCode  = 'xxx';
    if (typeof body === 'object' && body.message) errMsg = body.message;
    else if (error && error.message) errMsg = error.message;
    if (typeof response === 'object' && response.statusCode) statusCode = response.statusCode;
    console.log(`Server connection issue! url: ${uri}\nerror code:\t${statusCode}\nerror msg:\t${errMsg}\n`);
    return errMsg;
  }

  if (typeof params === 'undefined') params = {};
  return new Promise((res, rej) => {
    let uri = `${base_url}/${apiMethod}`;
    request({ uri: uri, json: true, qs: params }, (error, response, body) => {
      // console.log('API', {
      //   error: (error) ? error.message : '',
      //   response: (response) ? response.statusCode : '',
      //   body: body
      // });
      if (error || response.statusCode !== 200) return rej(rejectMessage(uri, error, response, body));
      res(body);
    });
  });
}

/**
 * Router :: Middleware Funnel
 */

// Handle Request
router.get('/foo', (req, res, next) => {
  params = {
    address: 'XDFSNv9mhpgr3LyXCFpthDdpshogHic63a',
    signed: encodeURIComponent('INmag9+qfn77nADR379kxqWqqXEvb7+ekWRQJNJkS1+/nrSC+YC+qTbmpTobUryXgg/hS4K5Lx5wrhh8WDPQ6Lk='),
    message: 'baby'
  };

  apiRequest('blockchain/verifymessage', params)
  .then((body) => {
    res.json({ status: 'ok', valid: body });
  })
  .catch((err) => {
    console.log(err);
    res.json({ status: 'error', err: err });
  });
});

module.exports = router;
