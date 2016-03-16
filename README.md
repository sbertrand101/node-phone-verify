# Phone Verication App

This example app shows how you can use the Catapult API verify a phone number by sending to it a SMS or phone call with confirm code. 

Uses the:
* [Catapult Node SDK](https://github.com/bandwidthcom/node-bandwidth)
* [Making calls](http://ap.bandwidth.com/docs/rest-api/calls/#resourcePOSTv1usersuserIdcalls/?utm_medium=social&utm_source=github&utm_campaign=dtolb&utm_content=_)
* [Sending sms](http://ap.bandwidth.com/docs/rest-api/messages/#resourcePOSTv1usersuserIdmessages/?utm_medium=social&utm_source=github&utm_campaign=dtolb&utm_content=_)
* [Bandwidth XML](http://ap.bandwidth.com/docs/xml/?utm_medium=social&utm_source=github&utm_campaign=dtolb&utm_content=_)


## Prerequisites
- Configured Machine with Ngrok/Port Forwarding -OR- Heroku Account
  - [Ngrok](https://ngrok.com/)
  - [Heroku](https://www.heroku.com/)
- [Node 4.2+](https://nodejs.org/en/download/releases/)
- [MongoDB](https://www.mongodb.org/)

## Deploy To PaaS

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

#### Env Variables Required To Run
* ```CATAPULT_USER_ID```
* ```CATAPULT_API_TOKEN```
* ```CATAPULT_API_SECRET``

## Demo
![Screen Shot](/readme_images/screenshot.png?raw=true)
Open the app in web browser. You will list of verified phone numbers. To verify a phone number go to `/verify`.



## Install on Local Machine

Before running this app run mongodb instance and export next environment variables :
* ```CATAPULT_USER_ID```
* ```CATAPULT_API_TOKEN```
* ```CATAPULT_API_SECRET```

```bash
# clone the app

git clone git@github.com:BandwidthExamples/node-phone-verificator.git

# install dependencies

npm install

# run the app

cd ..

PORT=3000 npm start 

```

Run in another terminal

```bash
ngrok http 3000 #to make ngrok to open external access to localhost:3000 
```

Open in browser your external url (it will be shown by ngrok).

## Deploy on Heroku Manually

Create account on [Heroku](https://www.heroku.com/) and install [Heroku Toolbel](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) if need.

Run `heroku create` to create new app on Heroku and link it with current project.

Run `heroku addons:create mongolab` to add mongodb support.

Configure the app by commands

```
 heroku config:set CATAPULT_USER_ID=your-user-id
 heroku config:set CATAPULT_API_TOKEN=your-token
 heroku config:set CATAPULT_API_SECRET=your-secret
```

Run `git push heroku master` to deploy this project.

Run `heroku open` to see home page of the app in the browser
