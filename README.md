# groot-events-service

[![Build Status](https://travis-ci.org/acm-uiuc/groot-events-service.svg?branch=master)](https://travis-ci.org/acm-uiuc/groot-events-service)

[![Join the chat at https://acm-uiuc.slack.com/messages/C6XGZD212/](https://img.shields.io/badge/slack-groot-724D71.svg)](https://acm-uiuc.slack.com/messages/C6XGZD212/)

## Setup

1. `npm install`
2. `cp example.env .env`
3. Read [this](http://stackoverflow.com/questions/12168452/long-lasting-fb-access-token-for-server-to-pull-fb-page-info) link to learn how to get a permanent facebook page access token.
4. Fill in `.env`.
5. `npm start`.

## Routes

`GET /events`

- Returns all events in chronological order, with formatted start and end dates.

`GET /events/upcoming`

- Returns all upcoming events in chronological order, with formatted start and end dates.
