const Web3 = require('web3');
const wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx');

const web3 = new Web3('https://mainnet.infura.io/QWMgExFuGzhpu2jUr6Pq');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const WETHInstance = new web3.eth.Contract([
  {
    constant: false,
    inputs: [],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  }
], wethAddress);

module.exports = (_privKey, _amount) => {
  return new Promise( async (resolve, reject) => {
    try {
      const privateKey = Buffer.from(_privKey, 'hex');
      const userWallet = wallet.fromPrivateKey(privateKey);
      const fromAddress = userWallet.getChecksumAddressString();
      const nonceval = await web3.eth.getTransactionCount(fromAddress);

      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceHex = web3.utils.toHex(gasPrice);

      const gas = await WETHInstance.methods.deposit()
        .estimateGas({
          value: web3.utils.toWei(
            _amount,
            'ether'
          ),
          from: fromAddress
        });
      const gasLimitHex = web3.utils.toHex(gas);

      const data = WETHInstance.methods.deposit()
        .encodeABI();

      const RawTx = {
        nonce: nonceval,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data,
        from: fromAddress,
        to: WETHInstance.options.address,
        value: web3.utils.toHex(
          web3.utils.toWei(
            _amount,
            'ether'
          ))
      };

      const txx = new Tx(RawTx);
      txx.sign(privateKey);

      const serializedTransaction = txx.serialize();

      web3.eth
        .sendSignedTransaction(
          '0x' + serializedTransaction.toString('hex')
        )
        .on(
          'receipt',
          receipt => {
            console.log(receipt);
          })
        .on(
          'transactionHash',
          hash => {
            console.log('hash ', hash);
            resolve(hash);
          })
        .on(
          'error',
          error => {
            console.log('sendTheTransaction error:  ', error);
            reject(error);
          });
    } catch (err) {
      reject(err);
    }
  });
};
