"use strict";
const debug = require("debug")("routes");

module.exports = (router) => {
  router.get("/", function* () { this.redirect("/log"); });

  router.get("/log", function* () {
    let entires = yield this.models.PhoneVerificationLogEntry.where("verifiedTime").ne(null).sort({ verifiedTime: "descending" }).exec();
    yield this.render("log", { entries: entires });
  });

  router.get("/verify", function* () { yield this.render("verify"); });

  router.get("/result", function* () { yield this.render("result"); });

  router.get("/call-callback", function* () {
    let code = this.query.tag;
    debug("Catapult callback query %j", this.query);
    if (!code || this.query.eventType != "answer") {
      this.body = "";
      return;
    }
    // speak code to user and hang up
    this.type = "text/xml";
    this.body = (new this.catapult.xml.Response([
      new this.catapult.xml.SpeakSentence({
        sentence: `Your confirm code is ${code}`,
        locale: "en_US",
        gender: "female",
        voice: "julie"
      }),
      new this.catapult.xml.Hangup()
    ])).toXml();
  });

  router.post("/verify", function* () {
    let form = this.request.body;
    debug("Verify form %j", form);
    let code = 1000 + Math.round(Math.random() * 8999);
    if (form.action.toLowerCase() === "call") {
      debug("Calling to %s", form.phoneNumber);
      yield this.catapult.Call.create.bind(this.catapult.Call).promise({
        from: this.servicePhoneNumber,
        to: form.phoneNumber,
        callbackHttpMethod: "GET",
        callbackUrl: `http://${this.req.headers.host}/call-callback`,
        tag: code
      });
    }
    else {
      debug("Sending a SMS to %s", form.phoneNumber);
      yield this.catapult.Message.create.bind(this.catapult.Message).promise({
        from: this.servicePhoneNumber,
        to: form.phoneNumber,
        text: `Your confirm code is ${code}`
      });
    }
    debug("Saving record to db");
    let entry = new this.models.PhoneVerificationLogEntry({
      phoneNumber: form.phoneNumber,
      code: code
    });
    yield entry.save();
    yield this.render("code", entry);
  });

  router.post("/code", function* () {
    let form = this.request.body;
    debug("Status code form %j", form);
    let entry = yield this.models.PhoneVerificationLogEntry.findOne({
      code: form.code,
      phoneNumber: form.phoneNumber
    });
    if (!entry) {
      return this.render("/verify");
    }
    debug("Status code has been confirmed");
    entry.verifiedTime = new Date();
    yield entry.save();
    this.redirect("/result");
  });
};