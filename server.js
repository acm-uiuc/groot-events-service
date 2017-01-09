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
const app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_ACM_PAGE_ID;

function getPageAccessToken(callback) {
  request({
    url: 'https://graph.facebook.com/me/accounts?access_token=' + ACCESS_TOKEN,
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
  });
}

function getEvents(callback) {
  getPageAccessToken(function(page_access_token) { 
    getRawEvents(page_access_token, function(raw_events) { 
      callback(raw_events);
    });
  });
}

app.get('/events', function(req, res) {
  getEvents(function(events) {
    res.json(events);
  });
});

io.on('connection', function (socket) {
  getEvents(function(events) { 
    socket.emit('facebook events', events);
  });
});

if (!ACCESS_TOKEN) {
  console.log("ERROR! PAGE ACCESS TOKEN not supplied");
} else if (!PAGE_ID) {
  console.log("ERROR! PAGE ID not supplied");
} else {
  server.listen(PORT);
  console.log("Your Facebook Page Access Token and Page ID are present");
  console.log('GROOT EVENTS SERVICES is live on port ' + PORT + "!");
}