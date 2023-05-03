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

This app has been deployed on: https://jb-crypto-portfolio.onrender.com/

The deployment is done through render.com here: https://dashboard.render.com/web/srv-ch948crhp8u0vh9p3r90/deploys/dep-ch948d3hp8u0vh9p3srg

The github repository is connected to the webservice, so you can push new commits directly and run a new deployment.