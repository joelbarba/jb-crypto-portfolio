const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'https://api.binance.com/api' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: ['*/*'] }));
app.use(nocache());

app.get('/', function(req, res, next) { return res.sendFile(path.join(__dirname, './index.html')); });
app.get('/mob.html', function(req, res, next) { return res.sendFile(path.join(__dirname, './mob.html')); });
app.get('/client.js', function(req, res, next) { return res.sendFile(path.join(__dirname, './client.js')); });
app.get('/style.css', function(req, res, next) { return res.sendFile(path.join(__dirname, './style.css')); });
app.get('/mob.css', function(req, res, next) { return res.sendFile(path.join(__dirname, './mob.css')); });
app.get('/favicon.png', function(req, res, next) { return res.sendFile(path.join(__dirname, './favicon.png')); });

app.listen(PORT, () => console.log(`Server ready on http://127.0.0.1:${PORT}`));

// https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR

app.get('/api/price', (req, res, next) => {
  // console.log('WebAPI Binance --> ', req.params[0], req.query);
  const apiReq = { method: req.method, json: true, qs: req.query };
  request('https://api.binance.com/api/v3/ticker/price', apiReq, (err, httpResponse) => {
    console.log(httpResponse.body);
    if (err) { return console.log(err); }
    res.send(httpResponse.body);
  });
});

app.get('/api/fake-price', (req, res, next) => {
  const symbol = req.query.symbol;
  if (symbol === 'BTCUSDT') { return res.send({ price: 29313.81 }); }
  if (symbol === 'BTCEUR')  { return res.send({ price: 26881.46 }); }
  if (symbol === 'EURUSDT') { return res.send({ price: 1.0903 }); }
  if (symbol === 'ETHUSDT')   { return res.send({ price: 1985.73 }); } if (symbol === 'ETHBTC')   { return res.send({ price: 0.06752800 }); }
  if (symbol === 'ALGOUSDT')  { return res.send({ price: 0.2054 });  } if (symbol === 'ALGOBTC')  { return res.send({ price: 0.00000701  }); }
  if (symbol === 'ATOMUSDT')  { return res.send({ price: 11.768 });  } if (symbol === 'ATOMBTC')  { return res.send({ price: 0.00040190 }); }
  if (symbol === 'DOTUSDT')   { return res.send({ price: 6.433  });  } if (symbol === 'DOTBTC')   { return res.send({ price: 0.00022040   }); }
  if (symbol === 'MATICUSDT') { return res.send({ price: 1.1096 });  } if (symbol === 'MATICBTC') { return res.send({ price: 0.00003800  }); }
  if (symbol === 'ADAUSDT')   { return res.send({ price: 0.4159 });  } if (symbol === 'ADABTC')   { return res.send({ price: 0.00001429 }); }
  if (symbol === 'SOLUSDT')   { return res.send({ price: 22.78  });  } if (symbol === 'SOLBTC')   { return res.send({ price: 0.00079200 }); }
  if (symbol === 'MANAUSDT')  { return res.send({ price: 0.6257 });  } if (symbol === 'MANABTC')  { return res.send({ price: 0.00002152 }); }
  if (symbol === 'SANDUSDT')  { return res.send({ price: 0.6438 });  } if (symbol === 'SANDBTC')  { return res.send({ price: 0.00002207 }); }
  if (symbol === 'ARBUSDT')   { return res.send({ price: 1.5333 });  } if (symbol === 'ARBBTC')   { return res.send({ price: 0.00005311 }); }
  if (symbol === 'XRPUSDT')   { return res.send({ price: 1.5333 });  } if (symbol === 'XRPBTC')   { return res.send({ price: 0.00002311 }); }
});

