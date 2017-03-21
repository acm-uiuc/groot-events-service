# groot-events-service

[![Build Status](https://travis-ci.org/acm-uiuc/groot-events-service.svg?branch=master)](https://travis-ci.org/acm-uiuc/groot-events-service)

Groot core development:

[![Join the chat at https://gitter.im/acm-uiuc/groot-development](https://badges.gitter.im/acm-uiuc/groot-development.svg)](https://gitter.im/acm-uiuc/groot-development?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Questions on how to add your app to Groot or use the Groot API:

[![Join the chat at https://gitter.im/acm-uiuc/groot-users](https://badges.gitter.im/acm-uiuc/groot-users.svg)](https://gitter.im/acm-uiuc/groot-users?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


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
