const {
  hashPersonalMessage,
  ecsign,
  toRpcSig,
  toBuffer
} = require('ethereumjs-util');

function signOrder (_privKey, _orderId) {
  const sha = hashPersonalMessage(toBuffer(_orderId));
  const ecdsaSignature = ecsign(sha, toBuffer(_privKey));
  const signature = toRpcSig(
    ecdsaSignature.v,
    ecdsaSignature.r,
    ecdsaSignature.s
  );
  return signature;
}

module.exports = signOrder;
