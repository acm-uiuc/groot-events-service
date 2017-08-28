/**
* Copyright © 2017, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const path = require('path');
const request = require('request');
const moment = require('moment');
require('dotenv').config({path: path.resolve(__dirname) + '/.env'});

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_ACM_PAGE_ID;

function parseEvent(event) {
  if (event.start_time) {
    event.start_time =  moment.parseZone(event.start_time).local().format("MMMM D YYYY, h:mm A");
  }

  if (event.end_time) {
    event.end_time =  moment.parseZone(event.end_time).local().format("MMMM D YYYY, h:mm A");
  }

  event.url = "https://www.facebook.com/events/" + event.id;
  
  return event;
}

function getPageAccessToken(callback) {
  request({
    url: 'https://graph.facebook.com/me/accounts?access_token=' + ACCESS_TOKEN,
    method: 'GET',
    json: true
  }, function(error, response, body) { 
    if (response && response.statusCode == 200) {
      body.data.forEach(function(item) {
        if (item.id == PAGE_ID) {
          callback && callback(item.access_token);
        }
      });
    }
  });
}

function getFBEvents(page_access_token, callback) {
  request({
    url: 'https://graph.facebook.com/' + PAGE_ID + '?fields=events&limit=50&access_token=' + ACCESS_TOKEN,
    method: 'GET',
    json: true
  }, function(error, response, body) {
    if (response && response.statusCode == 200) {
      callback && callback(body.events.data);
    }
  });
}

function getRawEvents(callback) {
  getPageAccessToken(function(page_access_token) {
    getFBEvents(page_access_token, function(raw_events) {
      callback && callback(raw_events);
    });
  });
}

function getEvents(callback) {
  getRawEvents(function(raw_events) {
    var orderedEvents = [];
    for (var event of raw_events) {
      orderedEvents.unshift(parseEvent(event));
    }
    callback && callback(orderedEvents);
  });
}

function getUpcomingEvents(callback) {
  const today = new Date();
  getRawEvents(function(raw_events) {
    var orderedUpcomingEvents = [];
    for (var event of raw_events) {
      var eventDate = new Date(event.start_time);
      if (today < eventDate) { // an upcoming event
        orderedUpcomingEvents.unshift(parseEvent(event)); //to add to beginning
      }
    }
    callback && callback(orderedUpcomingEvents);
  });
}

module.exports = {
  ACCESS_TOKEN: ACCESS_TOKEN,
  PAGE_ID: PAGE_ID,
  getEvents: getEvents,
  getUpcomingEvents: getUpcomingEvents
};
