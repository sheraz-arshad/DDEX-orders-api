const axios = require('axios');

const getToken = require('../Utils/getToken');
const signOrder = require('../Utils/signOrder');


const URL_BUILD = 'https://api.ddex.io/v3/orders/build';
const URL_PLACE = 'https://api.ddex.io/v3/orders';
const URL_TICKER = 'https://api.ddex.io/v3/markets/';

module.exports = (
  privKey,
  amount,
  side,
  orderType,
  marketId,
  limitOrders
) => {
  return new Promise(async (resolve, reject) => {
    let price;

    if (orderType === 'market') {
      price = 0;
    } else {
      const resultTicker = await axios.get(
        `${URL_TICKER}${marketId}/ticker`
      );
      if (side === 'sell') {
        price = parseFloat(resultTicker.data.data.ticker.bid)
            + (
              parseFloat(resultTicker.data.data.ticker.bid) * 0.05
            );
      } else if (side === 'buy') {
        price = parseFloat(resultTicker.data.data.ticker.ask)
            - (
              parseFloat(resultTicker.data.data.ticker.ask) * 0.05
            );
      }
    }

    price = price.toFixed(6);

    try {
      const resultBuild = await axios.post(
        URL_BUILD,
        {
          amount,
          price,
          side,
          orderType,
          marketId,
        },
        {
          headers: {
            'Hydro-Authentication': getToken('0x' + privKey)
          }
        });


      if (resultBuild.data.data === undefined) {
        reject(resultBuild.data.desc);
        return;
      }

      const orderId = resultBuild.data
        .data.order.id;

      if (orderType === 'limit') {
        limitOrders.push({
          privKey,
          orderId,
          amount,
          side,
          orderType,
          marketId,
          time: Date.now()
        });
      }

      const signature = signOrder(
        '0x' + privKey,
        orderId
      );

      const resultPlace = await axios.post(
        URL_PLACE,
        {
          orderId,
          signature
        },
        {
          headers: {
            'Hydro-Authentication': getToken('0x' + privKey)
          }
        });

      if (resultPlace.data.data === undefined) {
        reject(resultPlace.data.desc);
        return;
      }

      resolve(resultPlace.data.data.order);
    } catch (err) {
      reject(err);
    }
  });
};
