// git add -A && git commit -m "some trades" && git push origin master
const holdings = {
  BTC:   2.27806646, // (1.02022840 + 1.25783806)  // trezor + bittrex
  ETH:   7.01267631, // (5.01914747 + 1.99352884)  // trezor + bittrex
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
const totalInvested = 65000;
// const totalInvested = localStorage.getItem('totalInvested') || 50000;
// localStorage.setItem('totalInvested', totalInvested);

document.getElementById('btn-copy-clipboard').addEventListener('click', () => copyToClipboard());
document.getElementById('btn-reload-prices').addEventListener('click', () => loadPrices());
document.getElementById('btn-stop').addEventListener('click', () => changePlay(false));
document.getElementById('btn-play').addEventListener('click', () => changePlay(true));
document.getElementById('btn-interv-down').addEventListener('click', () => {
  if (loadTime > 1) { 
    loadTime = Math.round(loadTime / 2);
    playSec = loadTime; 
  }
  showInterval();
});
document.getElementById('btn-interv-up').addEventListener('click', () => {
  loadTime = loadTime * 2; playSec = loadTime;
  showInterval();
});

document.getElementById('main-btc-usd').addEventListener('click', () => loadBTC());
// document.getElementById('btn-clear-storage').addEventListener('click', () => localStorage.clear());


const clock1 = document.getElementById('clock1');
const clock2 = document.getElementById('clock2');

projection = false;
const btcPriceEl = document.getElementById('btc-usd-price');
btcPriceEl.addEventListener('click', () => { projection = !projection; if (projection) { btcPriceEl.style.background = 'gray'; }});
document.addEventListener("wheel", (event) => {
  if (projection) {
    const wheelChange = event.deltaY > 0 ? 'down': 'up';
    console.log('moving wheel', wheelChange);

    const delta = wheelChange === 'up' ? 500.00 : -500.00;
    data.BTC.price.usdt = Math.floor((data.BTC.price.usdt + delta) / 100) * 100;
    data.BTC.price.eur =  Math.round(100 * data.BTC.price.usdt * data.USDT.price.eur) / 100;

    data.ETH.price.usdt = data.ETH.price.btc * data.BTC.price.usdt; 
    data.ETH.price.eur =  Math.round(100 * data.ETH.price.usdt * data.USDT.price.eur) / 100;

    calculateTotals();
    printCoin('BTC',  holdings.BTC,  data.BTC);
    printCoin('USDT', holdings.USDT, data.USDT);

    const el = document.getElementById('main-btc-usd');
    el.innerHTML = `1 BTC = <span class="usd-price">${num(data.BTC.price.usdt, 10, 2)}</span> $`;

    calculateTotals();
    console.log(data);

    printValues();
    btcPriceEl.style.background = 'gray';
  }
});


// Cold wallet check up
const coldWalletBtn = document.getElementById('cold-wallet-btn');
if (coldWalletBtn) { document.getElementById('cold-wallet-btn').addEventListener('click', () => loadColdWallet()); }
function loadColdWallet() {
  const cWlt = document.getElementById('cold-wallet-balance');
  const cWltWarn = document.getElementById('cold-wallet-warning');
  if (cWlt) {
    coldWalletBtn.disabled = true;
    // const address = `3Cs8YQDYuz2KGM27WTYCDHjdewT4c7KH2w`;
    const address1 = `bc1qfvddqmqr5rnq4tqvyxurs79stje0ugpuzvn5ry`;
    const address2 = `bc1qwsmymemk33gwuawrl2df8h5euhu2hxylhy72d9`;
    Promise.all([
      fetch(`https://blockchain.info/q/addressbalance/${address1}`).then(q => q.json()),
      fetch(`https://blockchain.info/q/addressbalance/${address2}`).then(q => q.json()),
    ]).then(([balance1, balance2]) => {
        const balance = (balance1 + balance2) /100000000;
        console.log('Cold Wallet Balance', balance);
        console.log(`address1 ${address1} = ${balance1} BTC`);
        console.log(`address1 ${address2} = ${balance2} BTC`);
        if (balance1 + balance2 !== 102022840) { cWltWarn.style.display = 'block'; }
        cWlt.innerHTML = `${balance}`;
        coldWalletBtn.disabled = false;

    }).catch(err => {
      console.log('Could not load Blockchain API');
    });
  }
}
loadColdWallet();




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
  document.title = `BTC = ${num(btcUsdt, 10, 2)} $`;

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
  // playSec = 0; document.getElementById('play-bar').innerText = '';
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

  // Los primeros 6.000 euros se tributan al 19%, 
  // los siguientes 6.000 a 50.000 euros al 21%, 
  // los siguientes 50.000 a 200.000 euros al 23%, 
  // los siguientes 200.000 a 300.000 euros al 27% 
  // y cualquier importe superior a 300.000 euros se tributa al 28%.

  let taxes = 0;
  let capital = net;
  if (capital > 300000) { taxes += (capital - 300000) * 0.28; capital = 300000; }
  if (capital > 200000) { taxes += (capital - 200000) * 0.27; capital = 200000; }
  if (capital >  50000) { taxes += (capital -  50000) * 0.23; capital =  50000; }
  if (capital >   6000) { taxes += (capital -   6000) * 0.21; capital =   6000; }
  if (capital >      0) { taxes += capital * 0.19; }
  const afterTax = net - taxes;

  document.getElementById('totals-taxes').innerHTML = `<span>-${num(taxes)} €</span>`;
  document.getElementById('totals-profit-after-taxes').innerHTML = `<span class="totals-profit">${afterTax > 0 ? '+': ''}${num(afterTax)}</span> €`;


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




let isPlaying = false;
let playSec = 1
let loadTime = 60;
let playInterval;

setInterval(() => {
  if (isPlaying) {
    playSec--;
    showInterval();
    if (playSec <= 0) { playSec = loadTime; loadBTC(); }
  }
  if (clock1) {
    const bcnTime = new Date();
    const dubTime = new Date();
    dubTime.setTime(dubTime.getTime() - (60*60*1000));
    clock1.innerHTML = `DUB: ${(dubTime + '').slice(0,24)}`;
    clock2.innerHTML = `BCN: ${(bcnTime + '').slice(0,24)}`;
  }
}, 1000);


async function changePlay(play = false) {
  isPlaying = play;
  console.log('play = ', play);
  document.getElementById('btn-stop').disabled = !play;
  document.getElementById('btn-play').disabled = !!play;
  // if (isPlaying && playSec <= 0) {
  //   playSec = loadTime;
  // }
  // while (isPlaying) {
  //   await loadBTC();
  //   await new Promise(resolve => {
  //     playInterval = setTimeout(resolve, loadTime*1000);
  //   });
  // }
  // if (play) {
  //   playInterval = setInterval(() => {
  //     playSec++;
  //     if (playSec === 0) { document.getElementById('play-bar').innerText = ''; }
  //     if (playSec === 1) { document.getElementById('play-bar').innerText = '.'; }
  //     if (playSec === 2) { document.getElementById('play-bar').innerText = '..'; }
  //     if (playSec === 3) { document.getElementById('play-bar').innerText = '...'; }
  //     if (playSec >= 3) {
  //       playSec = 0;
  //     }
  //     loadBTC();
  //   }, 200);
  // } else {
  //   if (playInterval) {
  //     clearInterval(playInterval);
  //     playInterval = null;
  //   }
  // }
}

function showInterval() {
  if (playSec < 60) {
    document.getElementById('play-bar').innerText = `Loading in ${playSec} seconds...`;
  } else {
    const min = Math.floor(playSec / 60);
    const sec = playSec - (min * 60);
    document.getElementById('play-bar').innerText = `Loading in ${min}:${ pad(sec, 2, '0') } ...`;

  }
}

async function loadBTC() {
  await loadPrices();
  // console.log('Loading BTC price...');
  // showLoading(true);
  // const btcUsdt = await getPrice('BTCUSDT');
  // const el = document.getElementById('main-btc-usd');
  // el.innerHTML = `1 BTC = <span class="usd-price">${num(btcUsdt, 10, 2)}</span> $`;
  // document.getElementById('last-update').innerText = Intl.DateTimeFormat('en-ie', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Brussels'}).format(new Date());
  // document.title = `1 BTC = ${num(btcUsdt, 10, 2)} $`;
  // // playSec = 0; document.getElementById('play-bar').innerText = `Every ${loadTime} seconds`;
  // showLoading(false);
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
