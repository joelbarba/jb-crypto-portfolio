// Push with: sh push.sh "commit message" - Public site on: https://jb-crypto.netlify.app/
const holdings = {
  BTC:   (0 + 1.72334315 + 0), // binance + trezor + bittrex
  ETH:   5.01914747,
  USDT:  0,
  EUR:   0,
  ATOM:  0, // 26.27370000,   // Alts sold for 0.0623711 BTC
  ALGO:  0, // 1418.40200000,
  DOT:   0, // 48.65130000,
  MATIC: 0, // 269.43030000,
  ADA:   0, // 551.14830000,
  SOL:   0, // 9.20079000,
  MANA:  0, // 333.66600000,
  SAND:  0, // 308.6910000,
  ARB:   0, // 96.6033,
  XRP:   0, // 574.425,
};  

// Object.entries(holdings).forEach(([key, val]) => localStorage.setItem(key, val));

const data = {};
const totals = { usd: 0, eur: 0, btc: 0 };
const totalInvested = 47000;
// const totalInvested = localStorage.getItem('totalInvested') || 47000;
// localStorage.setItem('totalInvested', totalInvested);

document.getElementById('btn-copy-clipboard').addEventListener('click', () => copyToClipboard());
document.getElementById('btn-reload-prices').addEventListener('click', () => loadPrices());
document.getElementById('btn-stop').addEventListener('click', () => changePlay(false));
document.getElementById('btn-play').addEventListener('click', () => changePlay(true));
// document.getElementById('btn-clear-storage').addEventListener('click', () => localStorage.clear());

const checkUsd = document.getElementById('usd-check');
const checkEur = document.getElementById('eur-check');
checkUsd.addEventListener('click', (ev) => checkCurrency('usd'));
checkEur.addEventListener('click', (ev) => checkCurrency('eur'));
function checkCurrency(curr) {
  if (curr === 'usd' && !checkUsd.checked && !checkEur.checked) { checkEur.checked = true; }
  if (curr === 'eur' && !checkEur.checked && !checkUsd.checked) { checkUsd.checked = true; }
  // console.log('click', checkUsd.checked, checkEur.checked);
  Object.entries({ ...holdings, header: '' }).forEach(([key, val]) => {
    document.getElementById(key.toLowerCase() + '-usd-price').style.display = checkUsd.checked ? 'table-cell' : 'none';
    document.getElementById(key.toLowerCase() + '-eur-price').style.display = checkEur.checked ? 'table-cell' : 'none';
    document.getElementById(key.toLowerCase() + '-usd-total').style.display = checkUsd.checked ? 'table-cell' : 'none';
    document.getElementById(key.toLowerCase() + '-eur-total').style.display = checkEur.checked ? 'table-cell' : 'none';
  });
  document.getElementById('separator-row').setAttribute('colspan', checkEur.checked && checkUsd.checked ? 5 : 3);
  document.getElementById('totals-btc').setAttribute('colspan', checkEur.checked && checkUsd.checked ? 2 : 1);
  document.getElementById('totals-usd-total').style.display = checkUsd.checked ? 'table-cell' : 'none';
  document.getElementById('totals-eur-total').style.display = checkEur.checked ? 'table-cell' : 'none';
  document.getElementById('totals-profit').style.display = checkEur.checked ? 'table-cell' : 'none';
  document.getElementById('profit-pad').setAttribute('colspan', checkUsd.checked && checkUsd.checked ? 4 : 2);
}
checkUsd.checked = true;
checkEur.checked = true;
document.getElementById('btn-filter-usd')?.addEventListener('click', () => { 
  checkUsd.checked = true;
  checkEur.checked = false;
  checkCurrency('usd');
});
document.getElementById('btn-filter-eur')?.addEventListener('click', () => { 
  checkUsd.checked = false;
  checkEur.checked = true;
  checkCurrency('eur');
});

async function loadPrices() {
  console.log('Loading prices...');
  showLoading(true);
  document.getElementById('btc-usd-price').style.background = '#ffcb0070';
  document.getElementById('eur-usd-price').style.background = '#ffcb0070';
  document.getElementById('usdt-usd-price').style.background = '#ffcb0070';
  const [btcUsdt, btcEur] = await Promise.all([getPrice('BTCUSDT'), getPrice('BTCEUR')]);
  const eurUsdt  = Math.round(1000000 * await getPrice('EURUSDT')) / 1000000;
  const usdtEur  = Math.round(1000000 / eurUsdt) / 1000000;
  data.BTC = { price: { usdt: btcUsdt, eur: btcEur, btc: 1 }};
  data.USDT = { price: { usdt: 1, eur: usdtEur, btc: 1 / btcUsdt }};
  data.EUR = { price: { usdt: eurUsdt, eur: 1, btc: 1 / btcEur }};
  calculateTotals();
  printCoin('BTC',  holdings.BTC,  data.BTC);
  printCoin('USDT', holdings.USDT, data.USDT);
  printCoin('EUR',  holdings.EUR,  data.EUR);

  const el = document.getElementById('main-btc-usd');
  el.innerHTML = `1 BTC = <span class="usd-price">${num(data.BTC.price.usdt, 10, 2)}</span> $`;
  console.log('----------------');

  async function fetchAlt(name, quantity) {
    document.getElementById(name.toLowerCase() + '-usd-price').style.background = '#ffcb0070';
    const obj = { price: { usdt: 0, btc: 0, eur: 0 }, totals: { usd: 0, eur: 0, btc: 0 }};
    if (quantity > 0) {
      obj.price.usdt = await getPrice(name + 'USDT');
      obj.price.btc = await getPrice(name + 'BTC');   // 1 algo = 0.00001141 btc  => 1 btc = 20900 eur
      obj.price.eur = Math.round(obj.price.btc * btcEur * 1000000) / 1000000;
    }
    printCoin(name, quantity, obj);
    return obj;
  }
  [data.ETH, data.ATOM, data.ALGO, data.DOT, data.MATIC, data.ADA, data.SOL, data.MANA, data.SAND, data.ARB, data.XRP] = await Promise.all([
    fetchAlt('ETH',   holdings.ETH),
    fetchAlt('ATOM',  holdings.ATOM),
    fetchAlt('ALGO',  holdings.ALGO),
    fetchAlt('DOT',   holdings.DOT),
    fetchAlt('MATIC', holdings.MATIC),
    fetchAlt('ADA',   holdings.ADA),
    fetchAlt('SOL',   holdings.SOL),
    fetchAlt('MANA',  holdings.MANA),
    fetchAlt('SAND',  holdings.SAND),
    fetchAlt('ARB',   holdings.ARB),
    fetchAlt('XRP',   holdings.ARB),
  ]);

  calculateTotals();
  console.log(data);

  printValues();
  showLoading(false);
  document.getElementById('last-update').innerText = Intl.DateTimeFormat('en-ie', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Brussels'}).format(new Date());
  playSec = 0; document.getElementById('play-bar').innerText = '';
}

function calculateTotals() {
  // console.log('Calculate totals...');
  totals.usd = 0;
  totals.eur = 0;
  totals.btc = 0;
  Object.entries(data).forEach(([key, coin]) => {
    const quantity = holdings[key];
    coin.totals = {
      usd: Math.round(quantity * coin.price.usdt * 100) / 100,
      eur: Math.round(quantity * coin.price.eur  * 100) / 100,
      btc: quantity * coin.price.btc,
    };
    totals.usd += coin.totals.usd;
    totals.eur += coin.totals.eur;
    totals.btc += coin.totals.btc;
  });
}

function printValues() {
  printCoin('BTC',  holdings.BTC,   data.BTC);
  printCoin('ETH',  holdings.ETH,   data.ETH);
  printCoin('ATOM', holdings.ATOM,  data.ATOM);
  printCoin('ALGO', holdings.ALGO,  data.ALGO);
  printCoin('DOT',  holdings.DOT,   data.DOT);
  printCoin('MATIC',holdings.MATIC, data.MATIC);
  printCoin('ADA',  holdings.ADA,   data.ADA);
  printCoin('SOL',  holdings.SOL,   data.SOL);
  printCoin('MANA', holdings.MANA,  data.MANA);
  printCoin('SAND', holdings.SAND,  data.SAND);
  printCoin('ARB',  holdings.ARB,   data.ARB);
  printCoin('XRP',  holdings.XRP,   data.XRP);
  printCoin('USDT', holdings.USDT,  data.USDT);
  printCoin('EUR',  holdings.EUR,   data.EUR);

  document.getElementById('totals-btc').innerHTML = ` ~ ${num(totals.btc, 16, 12)} BTC`;
  document.getElementById('totals-usd-total').innerHTML = `${num(totals.usd)} $`;
  document.getElementById('totals-eur-total').innerHTML = `<span class="totals-eur">${num(totals.eur)}</span> €`;

  const net = totals.eur - totalInvested;
  const netClass = net > 0 ? 'pos' : 'neg' ;
  document.getElementById('totals-profit').innerHTML = `<span class="totals-profit ${netClass}">${net > 0 ? '+': ''}${num(net)}</span> €`;
}

function printCoin(coinName, val, obj) {
  const decimals = (coinName === 'BTC' || coinName === 'ETH') ? 2 : 6;
  const coinLC = coinName.toLowerCase();
  const pad5Coin = rPad(coinName.toUpperCase(), 6);
  document.getElementById(coinLC + '-holdings').innerHTML = `${pad(val)} ${pad5Coin}`;
  document.getElementById(coinLC + '-usd-price').innerHTML = ` 1 ${pad5Coin} = <span class="usd-price">${num(obj.price.usdt, 10, decimals)}</span> $`;
  document.getElementById(coinLC + '-eur-price').innerHTML = ` 1 ${pad5Coin} = <span class="eur-price">${num(obj.price.eur, 10, decimals)}</span> €`;
  document.getElementById(coinLC + '-usd-total').innerHTML = `<span class="usd-total">${num(obj.totals.usd)}</span> $`;
  document.getElementById(coinLC + '-eur-total').innerHTML = `<span class="eur-total">${num(obj.totals.eur)}</span> €`;

  if (coinName === 'USDT') { document.getElementById(coinLC + '-usd-price').innerHTML = ` 1 ${pad5Coin} = ${pad(1)} $`; }
  if (coinName === 'EUR')  { document.getElementById(coinLC + '-eur-price').innerHTML = ` 1 ${pad5Coin} = ${pad(1)} €`; }

  document.getElementById(coinLC + '-usd-price').style.background = 'none';
}


// --------------- View Functions ------------------

function showLoading(loading = false) {
  document.getElementById('loading-label').style.display = loading ? 'block' : 'none';
  document.getElementById('btn-reload-prices').disabled = loading;
}

let playInterval;
let playSec = 0
function changePlay(play = false) {
  console.log('play = ', play);
  document.getElementById('btn-stop').disabled = !play;
  document.getElementById('btn-play').disabled = !!play;
  if (play) {
    playInterval = setInterval(() => {
      playSec++;
      // document.getElementById('play-bar').innerText += '·';
      document.getElementById('play-bar').innerText = 60 - playSec;
      if (playSec >= 60) {
        document.getElementById('play-bar').innerText = '';
        playSec = 0;
        loadPrices();
      }
    }, 1000);
  } else {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }
}

function copyToClipboard() {
  // const tag = document.getElementById('clipboard-input');
  // tag.innerText = text;
  // tag.select();
  // tag.setSelectionRange(0, 99999); // For mobile devices
  // navigator.clipboard.writeText(tag.value);
  let text = `\tUSD\tEUR\n`;
  text += `BTC\t${data.BTC.price.usdt}\t${data.BTC.price.eur}\n`;
  text += `ETH\t${data.ETH.price.usdt}\t${data.ETH.price.eur}\n`;
  text += `ATOM\t${data.ATOM.price.usdt}\t${data.ATOM.price.eur}\n`;
  text += `ALGO\t${data.ALGO.price.usdt}\t${data.ALGO.price.eur}\n`;
  text += `DOT\t${data.DOT.price.usdt}\t${data.DOT.price.eur}\n`;
  text += `MATIC\t${data.MATIC.price.usdt}\t${data.MATIC.price.eur}\n`;
  text += `ADA\t${data.ADA.price.usdt}\t${data.ADA.price.eur}\n`;
  text += `SOL\t${data.SOL.price.usdt}\t${data.SOL.price.eur}\n`;
  text += `MANA\t${data.MANA.price.usdt}\t${data.MANA.price.eur}\n`;
  text += `SAND\t${data.SAND.price.usdt}\t${data.SAND.price.eur}\n`;
  text += `ARB\t${data.ARB.price.usdt}\t${data.ARB.price.eur}\n`;
  text += `XRP\t${data.XRP.price.usdt}\t${data.XRP.price.eur}\n`;
  text += `USDT\t${data.USDT.price.usdt}\t${data.USDT.price.eur}\n`;
  text += `EUR\t${data.EUR.price.usdt}\t${data.EUR.price.eur}\n`;
  navigator.clipboard.writeText(text);
}

// --------------- Utility Functions ------------------

function num(number, width = 10, decimals = 2) {
  const rounder = Math.pow(10, decimals);
  const n = Math.round(rounder * (number + '')) / rounder;
  const neg = n < 0;
  const [ p1, p2 ] = (n + '').split('.');
  const a = p1.split('');
  if (neg) { a.shift(); } // remove the '-'
  let b = '';
  while (a.length) {
    b = a.pop() + b;
    if (a.length) b = a.pop() + b;
    if (a.length) b = a.pop() + b;
    if (a.length) b = ',' + b;
  }
  const res = (neg ? '-':'') + b + '.' + rPad(p2 || '0', decimals, '0');
  return pad(res, width);
}

function pad(number, width = 10, placeholder = '‎ ') { // lPad
  const n = number + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(placeholder) + n;
}

function rPad(number, width = 10, placeholder = '‎ ') {
  const n = number + '';
  return n.length >= width ? n : n + (new Array(width - n.length + 1).join(placeholder));
}

let urlType = 'binance';
// let urlType = 'fake';
async function getPrice(symbol) {
  console.log(`Getting ${symbol}...`);
  try {
    if (urlType === 'proxy') { // Going through Binance proxy
      res = await fetch(`api/price?symbol=${symbol}`).then(r => r.json());
    }
    if (urlType === 'fake') { // Fake endpoint
      res = await fetch(`api/fake-price?symbol=${symbol}`).then(r => r.json());    
    }
    if (urlType === 'binance') { // Direct Binance API
      res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then(r => r.json());
    }  
    return Number.parseFloat(res.price);    
  } catch(err) {
    console.log(err);
  }
}

loadPrices();
changePlay(false);
