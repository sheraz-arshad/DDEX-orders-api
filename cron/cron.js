const cron = require('node-cron');
const axios = require('axios');

const trade = require('../controllers/trade');
const getToken = require('../Utils/getToken');

const URLOrder = 'https://api.ddex.io/v3/orders/';
const URL_TICKER = 'https://api.ddex.io/v3/markets/';

async function cancelAndReplaceOrder ({
  privKey,
  orderId,
  amount,
  side,
  orderType,
  marketId,
  // eslint-disable-next-line no-unused-vars
  time
}) {
  try {
    // console.log("delete");
    await axios.delete(
      `${URLOrder}${orderId}`,
      {
        headers: {
          'Hydro-Authentication': getToken('0x' + privKey)
        }
      });
    // eslint-disable-next-line no-param-reassign
    orderType = 'market';

    const resultTicker = await axios.get(
      `${URL_TICKER}${marketId}/ticker`
    );

    amount = amount * parseFloat(
      resultTicker.data.data.ticker.ask
    );

    // console.log("trade again");
    await trade(
      privKey,
      amount,
      side,
      orderType,
      marketId
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = (limitOrders) => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('Cron is running with the number of orders in quene: ', limitOrders.length);
    try {
      for (let i = 0; i < limitOrders.length; i++) {
        const result = await axios.get(
          `${URLOrder}${limitOrders[i].orderId}`,
          {
            headers: {
              'Hydro-Authentication': getToken('0x' + limitOrders[i].privKey)
            }
          });

        // console.log("Result get:", result.data);
        const status = result.data.data.order.status;
        // console.log("status: ", status);
        if (status === 'full filled') {
          limitOrders.splice(i, 1);
        } else if (status === 'pending' && limitOrders[i].time + 900000 <= Date.now()) {
          // console.log("cancel and replace");
          await cancelAndReplaceOrder(limitOrders[i]);
          limitOrders.splice(i, 1);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
};

