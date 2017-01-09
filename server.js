/**
* Copyright © 2017, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const path = require("path");
require('dotenv').config({path: path.resolve(__dirname) + '/.env'});
const PORT = 8002;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_ACM_PAGE_ID;
const USER_ID = process.env.FACEBOOK_USER_ID || 'me';

function getPageAccessToken(callback) {
  request({
    url: 'https://graph.facebook.com/' + USER_ID + '/accounts?access_token=' + ACCESS_TOKEN,
    method: 'GET',
    json: true
  }, function(error, response, body) { 
    if (response && response.statusCode == 200) {
      body.data.forEach(function(item, index) {
        if (item.id == PAGE_ID) {
          callback(item.access_token)
        }
      });
    }
    else{
      console.log("The page access token isn't an admin of the page " + PAGE_ID);
      console.log("Response:\n" + body)
    }
  });
}

function getRawEvents(page_access_token, callback) {
  request({
    url: 'https://graph.facebook.com/' + PAGE_ID + '?fields=events&access_token=' + ACCESS_TOKEN,
    method: 'GET',
    json: true
  }, function(error, response, body) {
    if (response && response.statusCode == 200) {
      callback(body.events.data);
    }
  })
}

app.get('/events', function(req, res) {
  getPageAccessToken(function(page_access_token) { 
    getRawEvents(page_access_token, function(raw_events) { 
      res.json(raw_events);
    });
  });
});

if (!ACCESS_TOKEN) {
  console.log("ERROR! PAGE ACCESS TOKEN not supplied");
} else if (!PAGE_ID) {
  console.log("ERROR! PAGE ID not supplied");
} else {
  app.listen(PORT);
  console.log("Your Facebook Page Access Token and Page ID are present");
  console.log('GROOT EVENTS SERVICES is live on port ' + PORT + "!");
}