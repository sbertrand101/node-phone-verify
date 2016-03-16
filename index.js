"use strict";
const fs = require("mz/fs");
const co = require("co");
const koa = require("koa");
const router = require("koa-router")();
const serveStatic = require("koa-static");
const koaBody = require("koa-body");
const views = require("koa-views");
const catapult = require("node-bandwidth");
const mongoose = require("mongoose");
const moment = require("moment");
const debug = require("debug")("index");
const models = require("./models");

require("./routes")(router);
require("promisify-patch").patch();

let state;

function* loadState() {
  if (yield fs.exists("./state.json")) {
    state = JSON.parse(yield fs.readFile("./state.json"));
  }
  else {
    state = {};
  }
}

function* saveState() {
  yield fs.writeFile("./state.json", JSON.stringify(state, null, 2));
}

function* getServicePhoneNumber() {
  if (state.servicePhoneNumber) {
    return state.servicePhoneNumber;
  }
  let number = (yield catapult.AvailableNumber.searchLocal.bind(catapult.AvailableNumber).promise({ quantity: 1, city: "Cary", state: "NC" }))[0].number;
  yield catapult.PhoneNumber.create.bind(catapult.PhoneNumber).promise({ number: number });
  state.servicePhoneNumber = number;
  yield saveState();
  debug("Service number: %s", number);
  return number;
}


mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/phone-vericator");
mongoose.connection.on("error", function() {
  console.error("Couldn't open connection to mongodb");
});

catapult.Client.globalOptions.userId = process.env.CATAPULT_USER_ID;
catapult.Client.globalOptions.apiToken = process.env.CATAPULT_API_TOKEN;
catapult.Client.globalOptions.apiSecret = process.env.CATAPULT_API_SECRET;

let app = koa();
co(function* () {
  yield loadState();
  app
    .use(function* (next) {
      this.models = models;
      this.catapult = catapult;
      this.state = {
        moment: moment
      };
      this.servicePhoneNumber = yield getServicePhoneNumber();
      yield next;
    })
    .use(views("views", { map: { jade: "jade" }, default: "jade", extension: "jade" }))
    .use(koaBody())
    .use(router.routes())
    .use(serveStatic("public"))
    .use(router.allowedMethods());

  app.on("error", function(err, ctx) {
    console.error("Server error", err, ctx);
  });
  yield app.listen.bind(app, process.env.PORT || 3000);
  console.log("Ready");
}).catch(function(err) {
  console.error("Error on starting app: ", err.trace || err)
});
