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
const winston = require('winston');
const expressWinston = require('express-winston');
const nodemailer = require('nodemailer');
const smtpConfig = {
  host: 'express-smtp.cites.uiuc.edu',
  port: 25,
  secure: false,
  ignoreTLS: true,
};
const transporter = nodemailer.createTransport(smtpConfig);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  meta: false, // don't log metadata about requests (produces very messy logs if true)
  expressFormat: true, // Use the default Express/morgan request formatting.
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
process.on('uncaughtException', function (err) {
  if(process.env.EXCEPTION_FROM_EMAIL && process.env.EXCEPTION_TO_EMAIL){
    var mailOptions = {
      from: process.env.EXCEPTION_FROM_EMAIL, 
      to: process.env.EXCEPTION_TO_EMAIL,  
      subject: '[Groot-events-service] Fatal Error: ' + (new Date).toLocaleTimeString(), 
      text: 'Uncaught Exception: Groot Events Service\n' + err.stack,
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error);
      }else{
        console.log('Message sent: ' + info.response);
      }
    console.error((new Date).toLocaleTimeString() + ' uncaughtException:', err.message)
    console.error(err.stack)
    process.exit(1);

    });
  }
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