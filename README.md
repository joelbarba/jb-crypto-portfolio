# README

This is a nodeJs app that serves an html page to display a crypto portfolio.
It also exposes an endpoint that proxies the Binance API to get the current prices.

## Structure

The nodeJs server is coded in server.js
It serves the statics: "index.html" file, which loads "style.css" and "client.js"
It also exposes 2 endpoints:
- /api/price
- /api/fake-price

All the client logic is embeded in "client.js"

## Deployment

See https://render.com/docs/deploy-node-express-app or follow the steps below:

Create a new web service with the following values:
  * Build Command: `yarn`
  * Start Command: `node app.js`

