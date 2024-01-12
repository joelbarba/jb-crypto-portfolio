// alias push="sh ~/DEV/SHELL_SCRIPTS/push_crypto_site.sh"
// git add -A && git commit -m "some trades" && git push origin master
const holdings = {
  BTC:   2.44122233, // (2.44122233 + 0.00000000)  // trezor + bittrex
  ETH:   7.00967631, // (7.00967631 + 0.00000000)  // trezor + bittrex
  USDT:  0,
  EUR:   0,
  ATOM:  49.05030507,   // 26.27370000,   // Alts sold for 0.0623711 BTC
  ALGO:  2723.885413,   // 1418.40200000,
  DOT:   78.09,         // 48.65130000,
  MATIC: 702.6170939,   // 269.43030000,
  ADA:   923.9995149,   // 551.14830000,
  SOL:   7.26,          // 9.20079000,
  XRP:   879.10873954,  // 574.425,
  LINK:  37.84194528,
  INJ:   16.12, 
  AVAX:  12.85870458, 

  // MANA:  0, // 333.66600000,
  // SAND:  0, // 308.6910000,
  // ARB:   0, // 96.6033,
};  





const altCoins = () => ([data.ATOM, data.ALGO, data.DOT, data.MATIC, data.ADA, data.SOL, data.XRP, data.LINK, data.INJ, data.AVAX]);
// Object.entries(holdings).forEach(([key, val]) => localStorage.setItem(key, val));

const data = {};
const totals = { usd: 0, eur: 0, btc: 0 };
let totalInvested = 75000;
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


// -------- Projections System ------------------------
document.getElementById('eur-invested').value = totalInvested;
document.getElementById('eur-invested').addEventListener("input", ev => {
  totalInvested = document.getElementById('eur-invested').value; 
  calculateTotals();
  printValues();
});

let cellSel;
const btcPriceEl = document.getElementById('btc-usd-price');
btcPriceEl.addEventListener('click', () => selectCell('btc-price'));
document.getElementById('btc-holdings').addEventListener('click', () => selectCell('btc-holdings'));
document.getElementById('eth-holdings').addEventListener('click', () => selectCell('eth-holdings'));
document.getElementById('eur-invested').addEventListener('click', () => selectCell('eur-invested'));
function selectCell(val) {
  cellSel = val;
  btcPriceEl.style.background = cellSel === 'btc-price' ? 'gray' : 'none';
  document.getElementById('btc-holdings').style.background = cellSel === 'btc-holdings' ? 'gray' : 'none';
  document.getElementById('eth-holdings').style.background = cellSel === 'eth-holdings' ? 'gray' : 'none';
  document.getElementById('eur-invested').style.background = cellSel === 'eur-invested' ? 'yellow' : 'white';
}
document.addEventListener("wheel", (event) => {
  const wheelChange = event.deltaY > 0 ? 'down': 'up';
  // console.log('moving wheel', wheelChange);
  let delta = wheelChange === 'up' ? 1000.00 : -1000.00;

  if (cellSel === 'btc-price') {
    data.BTC.price.usdt = Math.floor((data.BTC.price.usdt + delta) / 1000) * 1000;
    data.BTC.price.eur =  Math.round(100 * data.BTC.price.usdt * data.USDT.price.eur) / 100;
    function projCoin(COIN) {
      COIN.price.usdt = COIN.price.btc * data.BTC.price.usdt;
      COIN.price.eur =  Math.round(100 * COIN.price.usdt * data.USDT.price.eur) / 100;
    }
    projCoin(data.ETH);
    altCoins().forEach(coin => projCoin(coin));
    calculateTotals();
    printCoin('BTC',  holdings.BTC,  data.BTC);
    printCoin('USDT', holdings.USDT, data.USDT);
    const el = document.getElementById('main-btc-usd');
    el.innerHTML = `1 BTC = <span class="usd-price">${num(data.BTC.price.usdt, 10, 2)}</span> $`;
  }
  if (cellSel === 'btc-holdings') {
    let delta = wheelChange === 'up' ? 0.01 : -0.01;
    holdings.BTC = Math.round((holdings.BTC + delta) * 100) / 100;
  }
  if (cellSel === 'eth-holdings') {
    let delta = wheelChange === 'up' ? 0.1 : -0.1;
    holdings.ETH = Math.round((holdings.ETH + delta) * 10) / 10;
  }
  if (cellSel === 'eur-invested') {
    let delta = wheelChange === 'up' ? 1000 : -1000;
    totalInvested = Math.round(totalInvested + delta);
    document.getElementById('eur-invested').value = totalInvested;
  }
  calculateTotals();
  printValues();
});





// Cold wallet check up
// const coldWalletBtn = document.getElementById('cold-wallet-btn');
// if (coldWalletBtn) { document.getElementById('cold-wallet-btn').addEventListener('click', () => loadColdWallet()); }
async function loadColdWallet() {
  const cWlt1 = document.getElementById('cold-wallet-balance1');
  const cWltWarn = document.getElementById('cold-wallet-warning');

  const address1 = `bc1qfvddqmqr5rnq4tqvyxurs79stje0ugpuzvn5ry`;
  const address2 = `bc1qwsmymemk33gwuawrl2df8h5euhu2hxylhy72d9`;
  const address3 = `14dMwyBgsRprxFYwqb2BUaq9aGpeZYGVch`; // non-segwit
  const address4 = `0x876FA3a36289df2104A1A2384BEb88a028DB48d1`;  // eth

  const balance1 = 52000000;
  const balance2 = 50022840;
  const balance3 = 142099393;
  const balance4 = 7.00967631;

  // curl https://blockchain.info/q/addressbalance/bc1qfvddqmqr5rnq4tqvyxurs79stje0ugpuzvn5ry
  // curl https://blockchain.info/q/addressbalance/bc1qwsmymemk33gwuawrl2df8h5euhu2hxylhy72d9
  // curl https://blockchain.info/q/addressbalance/14dMwyBgsRprxFYwqb2BUaq9aGpeZYGVch
  // curl https://api.ethplorer.io/getAddressInfo/0x876FA3a36289df2104A1A2384BEb88a028DB48d1?apiKey=freekey

  const cwb1 = document.getElementById('cold-wallet-balance1');
  const cwb2 = document.getElementById('cold-wallet-balance2');
  const cwb3 = document.getElementById('cold-wallet-balance3');
  const cwb4 = document.getElementById('cold-wallet-balance4');

  function checkBalance(balance, correctBalance, htmlObj, address) {
    console.log(`address ${address} = ${balance} BTC`);
    htmlObj.innerHTML = `${balance / 100000000}`;
    if (isNaN(balance)) { return; }
    if (balance != correctBalance) { cWltWarn.style.display = 'block'; htmlObj += ` != ${correctBalance / 100000000}`; }
  }

  await fetch(`https://blockchain.info/q/addressbalance/${address1}`).then(q => q.json()).then(currentBalance => {
    checkBalance(currentBalance, balance1, cwb1, address1);
  }).catch(err => console.log('Could not load Blockchain API'));
  
  await fetch(`https://blockchain.info/q/addressbalance/${address2}`).then(q => q.json()).then(currentBalance => {
    checkBalance(currentBalance, balance2, cwb2, address2);
  }).catch(err => console.log('Could not load Blockchain API'));
  
  await fetch(`https://blockchain.info/q/addressbalance/${address3}`).then(q => q.json()).then(currentBalance => {
    checkBalance(currentBalance, balance3, cwb3, address3);
  }).catch(err => console.log('Could not load Blockchain API'));
  

  fetch(`https://api.ethplorer.io/getAddressInfo/${address4}?apiKey=freekey`).then(q => q.json()).then(ethRes => {
    const balance = ethRes.ETH.balance;
    console.log(`ETH address ${address4} = ${balance} ETH`);
    cwb4.innerHTML = `${balance}`;
    if (balance !== balance4) { cWltWarn.style.display = 'block'; cwb4.innerHTML += ` != ${balance4}`; }
  }).catch(err => {
    console.log('Could not load ETH Blockchain API');
  });

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
    if (!document.getElementById(key.toLowerCase() + '-usd-price')) {
      console.log('OOOOOOPS');
    }
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
    if (!document.getElementById(name.toLowerCase() + '-usd-price')) { 
      console.log('oops');
    }
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
  [data.ETH, data.ATOM, data.ALGO, data.DOT, data.MATIC, data.ADA, data.SOL, data.XRP, data.LINK, data.INJ, data.AVAX] = await Promise.all([
    fetchAlt('ETH',   holdings.ETH),
    fetchAlt('ATOM',  holdings.ATOM),
    fetchAlt('ALGO',  holdings.ALGO),
    fetchAlt('DOT',   holdings.DOT),
    fetchAlt('MATIC', holdings.MATIC),
    fetchAlt('ADA',   holdings.ADA),
    fetchAlt('SOL',   holdings.SOL),
    fetchAlt('XRP',   holdings.XRP),
    fetchAlt('LINK',  holdings.LINK),
    fetchAlt('INJ',   holdings.INJ),
    fetchAlt('AVAX',  holdings.AVAX),
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
  printCoin('XRP',  holdings.XRP,   data.XRP);
  printCoin('LINK', holdings.LINK,  data.LINK);
  printCoin('INJ',  holdings.INJ,   data.INJ);
  printCoin('AVAX', holdings.AVAX,  data.AVAX);
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
  if (!document.getElementById(coinLC + '-holdings')) {
    console.log('oops');
  }  
  document.getElementById(coinLC + '-holdings').innerHTML = `${pad(val)} ${pad5Coin}`;
  document.getElementById(coinLC + '-usd-price').innerHTML = ` 1 ${pad5Coin} = <span class="usd-price">${num(obj.price.usdt, 10, decimals)}</span> $`;
  document.getElementById(coinLC + '-eur-price').innerHTML = ` 1 ${pad5Coin} = <span class="eur-price">${num(obj.price.eur, 10, decimals)}</span> €`;
  document.getElementById(coinLC + '-usd-total').innerHTML = `<span class="usd-total">${num(obj.totals.usd)}</span> $`;
  document.getElementById(coinLC + '-eur-total').innerHTML = `<span class="eur-total">${num(obj.totals.eur)}</span> €`;
  const totalInBtcEl = document.getElementById(coinLC + '-btc-total');
  if (totalInBtcEl) { totalInBtcEl.innerHTML = `${num(obj.totals.btc, 1, 4)} btc`; }
  // if (totalInBtcEl) { totalInBtcEl.innerHTML = `${num(Math.round(obj.totals.btc * 10000) / 10000, 16, 12)}`; }

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
}



function copyToClipboard() {
  // const tag = document.getElementById('clipboard-input');
  // tag.innerText = text;
  // tag.select();
  // tag.setSelectionRange(0, 99999); // For mobile devices
  // navigator.clipboard.writeText(tag.value);
  function printLine(COIN) {
    return `\t${COIN.price.usdt}\t${COIN.price.eur}\t${COIN.price.btc}\t${COIN.totals.usd}\t${COIN.totals.eur}\t${COIN.totals.btc}\n`;
  }
  let text = `\tUSD\tEUR\tBTC\tUSD\tEUR\tBTC\n`;
  text += 'BTC'  + printLine(data.BTC);
  text += 'ETH'  + printLine(data.ETH);
  text += 'ATOM' + printLine(data.ATOM);
  text += 'ALGO' + printLine(data.ALGO);
  text += 'DOT'  + printLine(data.DOT);
  text += 'MATIC'+ printLine(data.MATIC);
  text += 'ADA'  + printLine(data.ADA);
  text += 'SOL'  + printLine(data.SOL);
  text += 'XRP'  + printLine(data.XRP);
  text += 'LINK' + printLine(data.LINK);
  text += 'INJ'  + printLine(data.INJ);
  text += 'AVAX' + printLine(data.AVAX);
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

async function getPrice(symbol) {
  console.log(`Getting ${symbol}...`);
  try {
    // const bitstampAlts = ['ALGOUSDT','DOTUSDT','MATICUSDT','ADAUSDT','SOLUSDT','XRPUSDT','LINKUSDT','INJUSDT','AVAXUSDT'];
    // if (bitstampAlts.indexOf(symbol) >= 0) {
    //   res = await fetch(`https://www.bitstamp.net/api/v2/ticker/${symbol.slice(0, -1).toLowerCase()}`).then(r => r.json());
    //   return Number.parseFloat(res.last);
    // }

    res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then(r => r.json());
    return Number.parseFloat(res.price);

  } catch(err) {
    console.log(err);
  }
}

// https://www.bitstamp.net/api/v2/currencies/
// https://www.bitstamp.net/api/v2/eur_usd/
// https://www.bitstamp.net/api/v2/ticker/btcusdt


loadPrices();
changePlay(false);
