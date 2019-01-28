const axios = require('axios');
const readline = require('readline');

const API_KEY = 'ABCD';
const allowedDollarsPerBuy = 42000;
const minimumSpreadToBuy = 0.7;
const bitcoinUSDPriceURL = 'https://api.bittrex.com/api/v1.1/public/getticker?market=USDT-BTC';


const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const getBitcoinPrice = async () => {
    const response = await axios.get(bitcoinUSDPriceURL);
    const { data } = response;
    if (data.success === true){
        return data.result;
    } else return null;
}

const calculateSpread = (btcPriceData) => {
    const { Bid, Ask, Last } = btcPriceData;
    // const Bid = btcPriceData.Bid;
    // const Ask = btcPriceData.Ask;
    // const Last = btcPriceData.Last;
    const diff = Ask - Bid;
    const spread = (diff / Last) * 100
    console.log(btcPriceData);

    return spread;
}

const initiateBitcoinBuyOrder = (btcPriceData, spread) => {
    const { Bid, Ask, Last } = btcPriceData;

    if (spread >= minimumSpreadToBuy) {
        const rate = Bid + .01
        const quantity = allowedDollarsPerBuy / rate;
        console.log(`**PLACING BUY ORDER FOR ${quantity.toFixed(8)} BITCOIN at $${rate.toFixed(2)} for a total of $${(quantity * rate).toFixed(2)}`);
        //const buyOrder = bitcoinBuyOrder(quantity, rate);

        return `here is your btc spread with the last price of $${Last.toFixed(2)}, krakka: ${spread.toFixed(3)}%`;
    }
    return `spread is too small to reasonably make a buy order here...`
}

const bitcoinBuyOrder = async (quantity, rate) => {
    const buyLimitURL = `https://api.bittrex.com/api/v1.1/market/buylimit?apikey=${API_KEY}&market=USDT-BTC&quantity=${quantity}&rate=${rate}`;

    const response = await axios.get(buyLimitURL);

    return response.data.success ? response.data.result : console.error('failed to place buy limit order');
}

const startApp = async () => {
    const btcPriceData = await getBitcoinPrice();
    const spread = calculateSpread(btcPriceData);
    const buyOrderResult = initiateBitcoinBuyOrder(btcPriceData, spread);

    console.log(buyOrderResult);

    console.log(`current: ${new Date()}`);
    console.log(`currentMsSINCE1970: ${Date.now()}`);
    console.log(`getTime: ${new Date().getTime()}`);
    
    askForHours();
}

const timeout = (delayMs) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delayMs);
    });
}

const askForHours = () => {
    readlineInterface.question('How many hours to you want to calculate from the current time?',
    (hoursInput) => {
        // 1. If invalid hours, ask for hours again.
        // 2. If invalid hours, exit the app.
        // Going with solution #1... alright implement! ($90/hr to three engineers, ⏳) accesmainprogram
        if (isNaN(hoursInput)) {
            console.log('Invalid hours');
            return askForHours();
        }
    
        console.log(`${hoursInput} hours into the future will be: ${addHours(new Date(), hoursInput)}`);
        readlineInterface.close();
    });
}

const addHours = (date, hours) => {
    return new Date(date.getTime() + (hours * 60 * 60 * 1000));
}

startApp();

