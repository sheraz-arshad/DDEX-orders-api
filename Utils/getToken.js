const {
  hashPersonalMessage,
  ecsign,
  toRpcSig,
  toBuffer,
  privateToAddress
} = require('ethereumjs-util');

function getToken (_privKey) {
  const message = 'HYDRO-AUTHENTICATION@' + Date.now();

  const address = '0x' + privateToAddress(_privKey).toString('hex');

  const sha = hashPersonalMessage(toBuffer(message));
  const ecdsaSignature = ecsign(sha, toBuffer(_privKey));
  const signature = toRpcSig(
    ecdsaSignature.v,
    ecdsaSignature.r,
    ecdsaSignature.s
  );
  return address + '#' + message + '#' + signature;
}

module.exports = getToken;
