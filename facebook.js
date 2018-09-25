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
const EVENT_DATE_FORMAT = "MMMM D YYYY, h:mm A";

function parseEvent(event) {
  const today = moment();
  if (event.start_time) {
    event.start_time = moment.parseZone(event.start_time)
                             .local().format(EVENT_DATE_FORMAT);
  }
  if (event.end_time) {
    event.end_time = moment.parseZone(event.end_time)
                           .local().format(EVENT_DATE_FORMAT);
  }

  // The end time for a recurring event is the last scheduled meeting time
  // Only change start and end time for this event for recurring events
  // that are still continuing
  if (event.event_times && moment(event.end_time).local() > today) {
    event.recurring_event = true;

    // Find the nearest start time and end time to today, and update the start
    // and end times in the parsed event
    event.event_times = event.event_times.filter((a) => {
      return moment(a.start_time) > today;
    }).sort((a, b) => {
      var diff = new Date(a.start_time) - new Date(b.start_time);
      return diff/(Math.abs(diff) || 1);
    });
    if (event.event_times[0].start_time) {
      event.start_time = moment.parseZone(event.event_times[0].start_time)
                             .local().format(EVENT_DATE_FORMAT);
    }    
    if (event.event_times[0].end_time) {
      event.end_time = moment.parseZone(event.event_times[0].end_time)
                             .local().format(EVENT_DATE_FORMAT);
    }
    if (event.event_times.length > 1) {
      event.next_event_start_time =
        moment.parseZone(event.event_times[1].end_time)
              .local().format(EVENT_DATE_FORMAT);
    }
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
  const today = moment();
  getRawEvents(function(raw_events) {
    var orderedUpcomingEvents = [];
    for (var event of raw_events) {
      var eventDate = moment(event.end_time).local();
      if (today < eventDate) { // an upcoming event
        orderedUpcomingEvents.unshift(parseEvent(event)); //to add to beginning
      }
    }
    orderedUpcomingEvents.sort((a, b) => {
      var diff = new Date(a.start_time) - new Date(b.start_time);
      return diff/(Math.abs(diff) || 1);
    });

    callback && callback(orderedUpcomingEvents);
  });
}

module.exports = {
  ACCESS_TOKEN: ACCESS_TOKEN,
  PAGE_ID: PAGE_ID,
  getEvents: getEvents,
  getUpcomingEvents: getUpcomingEvents
};
