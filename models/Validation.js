const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const moment    = require('moment');
 
const ValidationSchema = new Schema({
  // Unique ID for validation request
  id: {
    type: String, unique: true, index: true
  },

  // Address to be associated or used for validation
  address: {
    type: String, default: ''
  },

  // Random word used as part of the verification message
  word: {
    type: String, default: ''
  },

  // Encrypted verification string used to verify address
  verification: {
    type: String, default: ''
  },

  // Status of the verification request [unverified, denied, verified]
  status: {
    type: String, default: 'unverified'
  },

  // Timestamp of request start
  created_at: {
    type: Number, default: 0
  },

  // Timestamp of any updates done to modify the request
  updated_at: {
    type: Number, default: 0
  },

  // Timestamp of when the request was validated
  confirmed_at: {
    type: Number, default: 0
  }
}, { id: false });

ValidationSchema.pre('update', function(next) {
  this.update({}, { $set: {
    updated_at: moment().utc()
  }});

  next();
});

module.exports = mongoose.model('Validation', ValidationSchema);

