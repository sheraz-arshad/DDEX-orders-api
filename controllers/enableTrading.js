const Web3 = require('web3');
const wallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const web3 = new Web3('https://mainnet.infura.io/QWMgExFuGzhpu2jUr6Pq');

const proxyAddress = '0x74622073a4821dbfd046e9aa2ccf691341a076e1';


module.exports = (_privKey, _token) => {
  return new Promise(async (resolve, reject) => {
    const ContractInstance = new web3.eth.Contract(
      [
        {
          constant: false,
          inputs: [
            {
              name: 'guy',
              type: 'address'
            },
            {
              name: 'wad',
              type: 'uint256'
            }
          ],
          name: 'approve',
          outputs: [
            {
              name: '',
              type: 'bool'
            }
          ],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      _token
    );


    try {
      const privateKey = Buffer.from(_privKey, 'hex');
      const userWallet = wallet.fromPrivateKey(privateKey);
      const fromAddress = userWallet.getChecksumAddressString();

      const nonceval = await web3.eth.getTransactionCount(fromAddress);
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceHex = web3.utils.toHex(gasPrice);

      const amount = web3.utils.toHex(
        new BigNumber(2)
          .pow(256)
          .minus(1)
      );
      const gas = await ContractInstance.methods.approve(
        proxyAddress,
        amount
      ).estimateGas({ from: fromAddress });
      const gasLimitHex = web3.utils.toHex(gas);

      const data = ContractInstance.methods.approve(
        proxyAddress,
        amount
      ).encodeABI();

      const RawTx = {
        nonce: nonceval,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data,
        from: fromAddress,
        to: ContractInstance.options.address,
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
          // console.log('hash ', hash);
            resolve(hash);
          })
        .on(
          'error',
          error => {
          // console.log('sendTheTransaction error:  ', error);
            reject(error);
          });
    } catch (err) {
      reject(err);
    }
  });
};
