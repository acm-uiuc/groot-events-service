/**
* Copyright © 2016, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const PORT = 8002;
const app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const bodyParser = require('body-parser');
const request = require('request');
const facebook = require('./facebook.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/events', function(req, res) {
  facebook.getEvents(function(raw_events) {
    res.json(raw_events);
  });
});

app.get('/events/upcoming', function(req, res) {
  facebook.getUpcomingEvents(function(events) {
    res.json(events);
  });
});

io.on('connection', function (socket) {
  facebook.getUpcomingEvents(function(events) {
    socket.emit('facebook events', events);
  });
});

if (!facebook.ACCESS_TOKEN) {
  console.log("ERROR! PAGE ACCESS TOKEN not supplied");
} else if (!facebook.PAGE_ID) {
  console.log("ERROR! PAGE ID not supplied");
} else {
  server.listen(PORT);
  console.log("Your Facebook Page Access Token and Page ID are present");
  console.log('GROOT EVENTS SERVICES is live on port ' + PORT + "!");
}