// alias push="sh ~/DEV/SHELL_SCRIPTS/push_crypto_site.sh"
// git add -A && git commit -m "some trades" && git push origin master
const holdings = {
  BTC:   2.50154806, // (2.50131148 trezor + 0.00023658 phoenix)
  ETH:   7.00779553, // (7.00768131 trezor + 0.00011422 metamask)
  SOL:   27.49,
  ALGO:  2725.58307434,
  DOT:   78.09,
  MATIC: 702.6170939,
  ADA:   923.9995149,
  XRP:   718.4404566,
  LINK:  37.84194528,
  INJ:   16.12,
  AVAX:  12.85870458,
  IMX:   164.52,
  HBAR:  4086.64314034,
  RNDR:  56.91,
  KAS:   3415.34759,
  ATOM:  49.05030507,
  ICP:   37.20539115,
  TRX:   3973.23628,
  ENS:   8.69565217,
  GRT:   622.6068549,
  NEAR:  39.13128546,
  FIL:   22.34636872,
  ARB:   102.24426,
  FET:   83.20159747,
  SUI:   143.15368,
  JUP:   146.33147,
  PYTH:  165.03012,
  CFG:   147.6232654,
  XTZ:   76.28253242,
  BONK:  3751782.1,
  DYM:   15.90963,
  TIA:   6.72454,
  MINA:  82.44023083,
  AAVE:  0.85019554,
  OP:    45.30484,
  CHAT:  6.79296,
  USDT:  0,
  EUR:   0,
};


const altCoins = () => ([
  data.SOL,   data.ALGO,  data.DOT,   data.MATIC,  data.ADA,  data.XRP,   data.LINK,  data.INJ,
  data.AVAX,  data.IMX,   data.HBAR,  data.RNDR,   data.KAS,  data.ATOM,  data.ICP,   data.TRX,
  data.ENS,   data.GRT,   data.NEAR,  data.FIL,    data.ARB,  data.FET,   data.SUI,   data.JUP,
  data.PYTH,  data.CFG,   data.XTZ,   data.BONK,   data.DYM,  data.TIA,   data.MINA,  data.AAVE,  data.OP,  data.CHAT,
]);
// Object.entries(holdings).forEach(([key, val]) => localStorage.setItem(key, val));

const data = {};
const totals = { usd: 0, eur: 0, btc: 0 };
const investPerCoin = { // Invested EUR per coin
  BTC:   60230,
  ETH:   12770,
  SOL:   2500,
  ALGO:  500,
  DOT:   500,
  MATIC: 500,
  ADA:   500,
  XRP:   400,
  LINK:  500,
  INJ:   500,
  AVAX:  500,
  IMX:   500,
  HBAR:  500,
  RNDR:  500,
  KAS:   500,
  ATOM:  500,
  ICP:   500,
  TRX:   500,
  ENS:   200,
  GRT:   200,
  NEAR:  200,
  FIL:   200,
  ARB:   200,
  FET:   200,
  SUI:   200,
  JUP:   100,
  PYTH:  100,
  CFG:   100,
  XTZ:   100,
  BONK:  100,
  DYM:   100,
  TIA:   100,
  MINA:  100,
  AAVE:  100,
  OP:    200,
  CHAT:  100,
};
let totalInvested = Object.entries(investPerCoin).map(([k,v]) => v).reduce((a, v) => a + v, 0); // 85500
// const totalInvested = localStorage.getItem('totalInvested') || 50000;
// localStorage.setItem('totalInvested', totalInvested);

// Altcoins to lazy load (not displayed initially)

const coinGeckoMap = {
  ETH   : 'ethereum',
  SOL   : 'solana',
  ALGO  : 'algorand',
  DOT   : 'polkadot',
  MATIC : 'matic-network',
  ADA   : 'cardano',
  XRP   : 'ripple',
  LINK  : 'chainlink',
  INJ   : 'injective-protocol',
  AVAX  : 'avalanche-2',
  IMX   : 'immutable-x',
  HBAR  : 'hedera-hashgraph',
  RNDR  : 'render-token',
  KAS   : 'kaspa',
  ATOM  : 'cosmos',
  ICP   : 'internet-computer',
  TRX   : 'tron',
  ENS   : 'ethereum-name-service',
  GRT   : 'the-graph',
  NEAR  : 'near',
  FIL   : 'filecoin',
  ARB   : 'arbitrum',
  FET   : 'fetch-ai',
  SUI   : 'sui',
  JUP   : 'jupiter-exchange-solana',
  PYTH  : 'pyth-network',
  CFG   : 'centrifuge',
  XTZ   : 'tezos',
  BONK  : 'bonk',
  DYM   : 'dymension',
  TIA   : 'tia',
  MINA  : 'mina-protocol',
  AAVE  : 'aave',
  OP    : 'optimism',
  CHAT  : 'solchat',
};

const invisibleRows = ['ALGO','DOT','MATIC','ADA','XRP','LINK','INJ','AVAX','IMX','HBAR','RNDR','KAS',
'ATOM','ICP','TRX','ENS','GRT','NEAR','FIL','ARB','FET','SUI','JUP','PYTH','CFG','XTZ','BONK','DYM','TIA','MINA','AAVE','OP','CHAT'];

// <tr class="row-imx">
//   <td id="imx-holdings">...</td>
//   <td id="imx-usd-price">...</td>
//   <td id="imx-eur-price">...</td>
//   <td id="imx-btc-total">...</td>
//   <td id="imx-usd-total">...</td>
//   <td id="imx-eur-total">...</td>
// </tr>
// generate Html Table
const mainTable = document.getElementById('main-table');
Object.keys(holdings).forEach((name, ind) => {
  lName = name.toLowerCase();
  let newRow = mainTable.insertRow(1 + ind);
  newRow.id = 'row-' + lName;
  if (invisibleRows.indexOf(name) >= 0) { newRow.classList.add('invisible'); }
  let newCells = [newRow.insertCell(0), newRow.insertCell(1), newRow.insertCell(2), newRow.insertCell(3), newRow.insertCell(4), newRow.insertCell(5), newRow.insertCell(6)];
  newCells[0].id = lName + '-holdings';
  newCells[1].id = lName + '-usd-price';
  newCells[2].id = lName + '-eur-price';
  newCells[3].id = lName + '-btc-total';
  newCells[4].id = lName + '-usd-total';
  newCells[5].id = lName + '-eur-total';
  newCells[6].id = lName + '-profit';
  newCells[6].classList.add('profit-cell');
  newCells[3].classList.add('coin-btc-total');
});

showAll = false;
const loadAllBtn = document.getElementById('load-all-alts');
if (loadAllBtn) { loadAllBtn.addEventListener('click', () => {
  showAll = !showAll;

  if (showAll) { 
    mainTable.classList.add('small-table'); 
    loadAllBtn.innerText = 'Collapse Altcoins';
    document.getElementById('hidden-inv-msg').style.display = 'none';
  } else { 
    mainTable.classList.remove('small-table'); 
    loadAllBtn.innerText = 'Load All Altcoins';
  }

  
  invisibleRows.forEach((name, ind) => {
    const tr = document.getElementById('row-' + name.toLowerCase());
    if (showAll) { tr.classList.remove('invisible'); }
    else { tr.classList.add('invisible'); }
  });

  loadPrices();
})}




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

document.getElementById('header-profits')?.addEventListener('click', () => mainTable.classList.add('table-with-profits'));

const clock1 = document.getElementById('clock1');
const clock2 = document.getElementById('clock2');


// Real time websocket price update
let realTime = false;
let realTimeIntervalId;
let ws;

const btcLabel = document.getElementById('btc-realtime');
const btnWSS = document.getElementById('btn-connect-wss');
if (btnWSS) {
  btnWSS.addEventListener('click', () => {
    if (!realTime) { // Turning On
      if (ws) { ws.close(); }
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@aggTrade');
      btnWSS.disabled = true;

      let msg;
      realTimeIntervalId = setInterval(function() {
        if (!msg) return;
        const value = num(JSON.parse(msg).p, 10, 2);
        document.title = `BTC = ${value} $`;
        btcLabel.innerHTML = `--> <span class="usd-realtime-price">${value}</span> $`;
      }, 100);

      ws.onmessage = function(e) { msg = e.data; };
      ws.onopen = function() {
        console.log('WebSocket Open');
        btnWSS.disabled = false; 
        btnWSS.innerHTML = '⏸';
        btcLabel.style.display = 'inline';
        realTime = true;
      }
      ws.onclose = function() {
        console.log('WebSocket Closed');
        btnWSS.innerHTML = '▶';
        //btcLabel.style.display = 'none';
        btnWSS.disabled = false;
        ws = null;
      }

    } else { // Turning Off
      if (realTimeIntervalId) { clearInterval(realTimeIntervalId); intervalRef = null; }
      if (ws) { ws.close(); btnWSS.disabled = true; }
      realTime = false;
    }
  });
}



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

  const address1 = `bc1qykluy9ph2j74h65685ly3vq5gxje8evd5hyf66`;  // Black 7
  const address2 = `bc1qmu0xcr0kf9e7dzld4kgvdvhx4f6nep6vhn2zmm`;  // White 1
  const address3 = `bc1qdlqvy9xmedwqat8sch3mq5y6hcvnvltfntvarc`;  // White 2
  const address4 = `0x70f47dD6D1b58033Ad18f436A8fC1531904749D7`;  // eth

  const balance1 = 125000000;
  const balance2 = 118130752;
  const balance3 =   7000396;
  const balance4 = 7.00768131;

  // curl https://blockchain.info/q/addressbalance/bc1qykluy9ph2j74h65685ly3vq5gxje8evd5hyf66
  // curl https://blockchain.info/q/addressbalance/bc1qmu0xcr0kf9e7dzld4kgvdvhx4f6nep6vhn2zmm
  // curl https://blockchain.info/q/addressbalance/bc1qdlqvy9xmedwqat8sch3mq5y6hcvnvltfntvarc
  // curl https://api.ethplorer.io/getAddressInfo/0x70f47dD6D1b58033Ad18f436A8fC1531904749D7?apiKey=freekey

  const cwb1 = document.getElementById('cold-wallet-balance1');
  const cwb2 = document.getElementById('cold-wallet-balance2');
  const cwb3 = document.getElementById('cold-wallet-balance3');
  const cwb4 = document.getElementById('cold-wallet-balance4');

  function checkBalance(balance, correctBalance, htmlObj, address) {
    console.log(`address ${address} = ${balance} BTC`);
    htmlObj.innerHTML = `${balance / 100000000}`;
    if (isNaN(balance)) { return; }
    if (balance != correctBalance) {
      cWltWarn.style.display = 'block'; 
      htmlObj.style.color = 'red';
      htmlObj.innerHTML += ` (current) != ${correctBalance / 100000000} (what it should be)`; 
    }
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
  document.getElementById('profit-pad').setAttribute('colspan', checkUsd.checked && checkUsd.checked ? 5 : 2);
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
    const obj = { price: { usdt: 0, btc: 0, eur: 0 }, totals: { usd: 0, eur: 0, btc: 0 }};
    data[name] = obj;

    if (!showAll && invisibleRows.indexOf(name) >= 0)  { return obj; }

    if (!document.getElementById(name.toLowerCase() + '-usd-price')) { 
      console.log('oops', name, ' has no html element');
    } else {
      document.getElementById(name.toLowerCase() + '-usd-price').style.background = '#ffcb0070';
    }
    if (quantity > 0) {
      obj.price = await getAltPrice(name, btcEur); // Access price on CoinGecko
    }
    printCoin(name, quantity, obj);
    // return obj;
  }

  await Promise.all([
    fetchAlt('ETH',   holdings.ETH),
    fetchAlt('SOL',   holdings.SOL),
    fetchAlt('ALGO',  holdings.ALGO),
    fetchAlt('DOT',   holdings.DOT),
    fetchAlt('MATIC', holdings.MATIC),
    fetchAlt('ADA',   holdings.ADA),
    fetchAlt('XRP',   holdings.XRP),
    fetchAlt('LINK',  holdings.LINK),
    fetchAlt('INJ',   holdings.INJ),
    fetchAlt('AVAX',  holdings.AVAX),
    fetchAlt('IMX',   holdings.IMX),
    fetchAlt('HBAR',  holdings.HBAR),
    fetchAlt('RNDR',  holdings.RNDR),
    fetchAlt('KAS',   holdings.KAS),
    fetchAlt('ATOM',  holdings.ATOM),
    fetchAlt('ICP',   holdings.ICP),
    fetchAlt('TRX',   holdings.TRX),
    fetchAlt('ENS',   holdings.ENS),
    fetchAlt('GRT',   holdings.GRT),
    fetchAlt('NEAR',  holdings.NEAR),
    fetchAlt('FIL',   holdings.FIL),
    fetchAlt('ARB',   holdings.ARB),
    fetchAlt('FET',   holdings.FET),
    fetchAlt('SUI',   holdings.SUI),
    fetchAlt('JUP',   holdings.JUP),
    fetchAlt('PYTH',  holdings.PYTH),
    fetchAlt('CFG',   holdings.CFG),
    fetchAlt('XTZ',   holdings.XTZ),
    fetchAlt('BONK',  holdings.BONK),
    fetchAlt('DYM',   holdings.DYM),
    fetchAlt('TIA',   holdings.TIA),
    fetchAlt('MINA',  holdings.MINA),
    fetchAlt('AAVE',  holdings.AAVE),
    fetchAlt('OP',    holdings.OP),
    fetchAlt('CHAT',  holdings.CHAT),
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
    if (!showAll && invisibleRows.indexOf(key) >= 0)  { return; }
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
  printCoin('BTC',   holdings.BTC,    data.BTC);
  printCoin('ETH',   holdings.ETH,    data.ETH);
  printCoin('SOL',   holdings.SOL,    data.SOL);
  printCoin('ALGO',  holdings.ALGO,   data.ALGO);
  printCoin('DOT',   holdings.DOT,    data.DOT);
  printCoin('MATIC', holdings.MATIC,  data.MATIC);
  printCoin('ADA',   holdings.ADA,    data.ADA);
  printCoin('XRP',   holdings.XRP,    data.XRP);
  printCoin('LINK',  holdings.LINK,   data.LINK);
  printCoin('INJ',   holdings.INJ,    data.INJ);
  printCoin('AVAX',  holdings.AVAX,   data.AVAX);
  printCoin('IMX',   holdings.IMX,    data.IMX);
  printCoin('HBAR',  holdings.HBAR,   data.HBAR);
  printCoin('RNDR',  holdings.RNDR,   data.RNDR);
  printCoin('KAS',   holdings.KAS,    data.KAS);
  printCoin('ATOM',  holdings.ATOM,   data.ATOM);
  printCoin('ICP',   holdings.ICP,    data.ICP);
  printCoin('TRX',   holdings.TRX,    data.TRX);
  printCoin('ENS',   holdings.ENS,    data.ENS);
  printCoin('GRT',   holdings.GRT,    data.GRT);
  printCoin('NEAR',  holdings.NEAR,   data.NEAR);
  printCoin('FIL',   holdings.FIL,    data.FIL);
  printCoin('ARB',   holdings.ARB,    data.ARB);
  printCoin('FET',   holdings.FET,    data.FET);
  printCoin('SUI',   holdings.SUI,    data.SUI);
  printCoin('JUP',   holdings.JUP,    data.JUP);
  printCoin('PYTH',  holdings.PYTH,   data.PYTH);
  printCoin('CFG',   holdings.CFG,    data.CFG);
  printCoin('XTZ',   holdings.XTZ,    data.XTZ);
  printCoin('BONK',  holdings.BONK,   data.BONK);
  printCoin('DYM',   holdings.DYM,    data.DYM);
  printCoin('TIA',   holdings.TIA,    data.TIA);
  printCoin('MINA',  holdings.MINA,   data.MINA);
  printCoin('AAVE',  holdings.AAVE,   data.AAVE);
  printCoin('OP',    holdings.OP,     data.OP);
  printCoin('CHAT',  holdings.CHAT,   data.CHAT);
  printCoin('USDT',  holdings.USDT,   data.USDT);
  printCoin('EUR',   holdings.EUR,    data.EUR);

  let hiddenInvestment = 0;
  if (!showAll) {
    hiddenInvestment = Object.entries(investPerCoin).filter(([k,v]) => invisibleRows.indexOf(k) >= 0).reduce((a, v) => a + v[1], 0);
    console.log(`There are ${hiddenInvestment} € invested but not displayed`);
    document.getElementById('hidden-inv-msg').innerHTML = `* There are ${hiddenInvestment} € invested but not displayed`;
    // totals.eur += hiddenInvestment;
  }

  document.getElementById('totals-btc').innerHTML = ` ~ ${num(totals.btc, 16, 12)} BTC`;
  document.getElementById('totals-usd-total').innerHTML = `${num(totals.usd)} $`;
  document.getElementById('totals-eur-total').innerHTML = `<span class="totals-eur">${num(totals.eur)}</span> €`;  

  const net = totals.eur - (totalInvested - hiddenInvestment);
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
  document.getElementById('totals-after-taxes').innerHTML = `<span class="totals-eur">${num(totals.eur - taxes)}</span> €`;
  document.getElementById('totals-profit-after-taxes').innerHTML = `<span class="totals-profit">${afterTax > 0 ? '+': ''}${num(afterTax)}</span> €`;


}




function printCoin(coinName, val, obj) {
  const decimals = (coinName === 'BTC' || coinName === 'ETH') ? 2 : 6;
  const coinLC = coinName.toLowerCase();
  const pad5Coin = rPad(coinName.toUpperCase(), 6);

  if (!document.getElementById(coinLC + '-holdings')) {
    console.log('oops');
    return;
  }
  document.getElementById(coinLC + '-holdings').innerHTML = `${pad(val)} <a class="coin-link" target="_blank" href="https://www.coingecko.com/en/coins/${coinGeckoMap[coinName]}">${pad5Coin}</a>`;
  document.getElementById(coinLC + '-usd-price').innerHTML = ` 1 ${pad5Coin} = <span class="usd-price">${num(obj.price.usdt, 10, decimals)}</span> $`;
  document.getElementById(coinLC + '-eur-price').innerHTML = ` 1 ${pad5Coin} = <span class="eur-price">${num(obj.price.eur, 10, decimals)}</span> €`;
  document.getElementById(coinLC + '-usd-total').innerHTML = `<span class="usd-total">${num(obj.totals.usd)}</span> $`;
  document.getElementById(coinLC + '-eur-total').innerHTML = `<span class="eur-total">${num(obj.totals.eur)}</span> €`;

  if (coinName !== 'EUR' && coinName !== 'USDT') {
    const profit = obj.totals.eur - investPerCoin[coinName];
    const profitEl = document.getElementById(coinLC + '-profit');
    if (profit < 0) {
      profitEl.classList.remove('profit-green');
      profitEl.classList.add('profit-red');
      profitEl.innerHTML = `${num(profit, 0)} €`;
    } else {
      profitEl.classList.add('profit-green');
      profitEl.classList.remove('profit-red');
      profitEl.innerHTML = `+ ${num(profit, 0)} €`;
    }
  }
  

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
  text += 'SOL'  + printLine(data.SOL);
  text += 'ALGO' + printLine(data.ALGO);
  text += 'DOT'  + printLine(data.DOT);
  text += 'MATIC'+ printLine(data.MATIC);
  text += 'ADA'  + printLine(data.ADA);
  text += 'XRP'  + printLine(data.XRP);
  text += 'LINK' + printLine(data.LINK);
  text += 'INJ'  + printLine(data.INJ);
  text += 'AVAX' + printLine(data.AVAX);
  text += 'IMX'  + printLine(data.IMX);
  text += 'HBAR' + printLine(data.HBAR);
  text += 'RNDR' + printLine(data.RNDR);
  text += 'KAS'  + printLine(data.KAS);
  text += 'ATOM' + printLine(data.ATOM);
  text += 'ICP'  + printLine(data.ICP);
  text += 'TRX'  + printLine(data.TRX);
  text += 'ENS'  + printLine(data.ENS);
  text += 'GRT'  + printLine(data.GRT);
  text += 'NEAR' + printLine(data.NEAR);
  text += 'FIL'  + printLine(data.FIL);
  text += 'ARB'  + printLine(data.ARB);
  text += 'FET'  + printLine(data.FET);
  text += 'SUI'  + printLine(data.SUI);
  text += 'JUP'  + printLine(data.JUP);
  text += 'PYTH' + printLine(data.PYTH);
  text += 'CFG'  + printLine(data.CFG);
  text += 'XTZ'  + printLine(data.XTZ);
  text += 'BONK' + printLine(data.BONK);
  text += 'DYM'  + printLine(data.DYM);
  text += 'TIA'  + printLine(data.TIA);
  text += 'MINA' + printLine(data.MINA);
  text += 'AAVE' + printLine(data.AAVE);
  text += 'OP'   + printLine(data.OP);
  text += 'CHAT' + printLine(data.CHAT);
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
    //   res = await fetch(`https://www.bitstamp.net/api/v2/ticker/algousd`).then(r => r.json());
    //   res = await fetch(`https://www.bitstamp.net/api/v2/ticker/${symbol.slice(0, -1).toLowerCase()}`).then(r => r.json());
    //   return Number.parseFloat(res.last);
    // }

    // Non listed
    if (symbol === 'KASUSDT')  { return 0.146; }
    if (symbol === 'KASBTC')   { return 0.000001985; }
    if (symbol === 'CFGUSDT')  { return 0.7357; }
    if (symbol === 'CFGBTC')   { return 0.000010141; }
    if (symbol === 'BONKUSDT') { return 0.00003511; }
    if (symbol === 'BONKBTC')  { return 0.0000000005; }
    if (symbol === 'JUPUSDT')  { return 0.9253; }
    if (symbol === 'JUPBTC')   { return 0.000012754; }

    res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then(r => r.json());
    return Number.parseFloat(res.price);

  } catch(err) {
    console.error(symbol);
  }
}
async function getAltPrice(coinName, btcEur) {
  const nonListed = ['KAS', 'CFG', 'BONK', 'JUP', 'CHAT']; // these are not listed in Binance, so get em from coin gecko
  if (nonListed.indexOf(coinName) >= 0) {
    console.log(`Getting ${coinName} from coingecko...`);
    const coinId = coinGeckoMap[coinName];
    // curl "https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur,usd,btc"  -H 'accept: application/json'
    // curl "https://api.coingecko.com/api/v3/simple/price?ids=centrifuge&vs_currencies=eur,usd,btc"  -H 'accept: application/json'
    // curl "https://api.coingecko.com/api/v3/simple/price?ids=bonk&vs_currencies=eur,usd,btc"  -H 'accept: application/json'
    // curl "https://api.coingecko.com/api/v3/simple/price?ids=jupiter&vs_currencies=eur,usd,btc"  -H 'accept: application/json'

    try {
      res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur,usd,btc`).then(r => r.json());
      // res = {"kaspa":{"eur":166.52,"usd":181.24,"btc":0.0026621}}

      const price = res[coinId];
      return { usdt: price.usd, eur: price.eur, btc: price.btc };

    } catch(err) { console.error(symbol); }

  } else { // Get them from Binance
    const usdt = await getPrice(coinName + 'USDT');
    const btc = await getPrice(coinName + 'BTC');   // 1 algo = 0.00001141 btc  => 1 btc = 20900 eur
    const eur = Math.round(btc * btcEur * 1000000) / 1000000;
    return { usdt, btc, eur };
  }
}

// https://www.bitstamp.net/api/v2/currencies/
// https://www.bitstamp.net/api/v2/eur_usd/
// https://www.bitstamp.net/api/v2/ticker/btcusdt


loadPrices();
changePlay(false);
