"use strict";

module.export = (router) => {
  router.get("/", function*(){ this.redirect("/log"); } );

  router.get("/log", function*(){
    let entires = yield this.models.PhoneVerificationLogEntry.where("verifiedTime").ne(null).sort({verifiedTime: "descending"}).exec();
    yield this.render("log", {entires: entires});
  });

  router.get("/verify", function*(){ yield this.render("verify"); } );

  router.get("/result", function*(){ yield this.render("result"); } );

  router.get("/call-callback", function*(){
    let code = this.query.code;
    if(!code || this.query.eventType != "answer"){
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

  router.post("/verify", function*(){
    let form = this.request.body;
    let code = 1000 + Math.round(Math.random()*8999);
    if (form.action.toLowerCase() === "call"){
      yield catapult.Call.create.bind(catapult.Call).promise({
        from: this.servicePhoneNumber,
        to: form.phoneNumber,
        callbackHttpMethod: "GET",
        callbackUrl: `http://${this.req.headers.host}/call-callback`,
        tag: code
      });
    }
    else{
      yield catapult.Message.create.bind(catapult.Message).promise({
        from: this.servicePhoneNumber,
        to: form.phoneNumber,
        text: `Your confirm code is ${code}`
      });
    }
    let entry = new this.models.PhoneVerificationLogEntry({
      phoneNumber: form.phoneNumber,
      code: code
    });
    yield entry.save();
    yield this.render("code", entry);
  });

  router.post("/code", function*(){
    let form = this.request.body;
    let entry = yield this.models.PhoneVerificationLogEntry.findOne({
      code: form.code,
      phoneNumber: form.phoneNumber
    });
    if(!entry){
      return this.render("/verify");
    }
    entry.verifiedTime = new Date();
    yield entry.save();
    this.redirect("/result");
  });
};