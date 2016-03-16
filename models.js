"use strict";
let mongoose = require("mongoose");

let PhoneVerificationLogEntrySchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, index: true },
  code: { type: String, index: true },
  verifiedTime: { type: Date, index: true },
});


module.exports = {
  PhoneVerificationLogEntry: mongoose.model("PhoneVerificationLogEntry", PhoneVerificationLogEntrySchema)
};