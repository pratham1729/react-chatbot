import { getChainId } from '../utils/index';
import { getTokenAddress } from '../utils/index';
import axios from 'axios';

export const price1inch = async (chain, tokens) => {
  var tokenAddress = [];
  const chainId = getChainId(chain.toLowerCase());
  tokens.map((x, i) => {
    tokenAddress.push(getTokenAddress(chainId, x.toLowerCase()));
  });
  console.log(tokens, tokenAddress);
  const priceData = await axios
    .post('http://localhost:8181/tokenPrices', {
      chainId: parseInt(chainId.slice(2), 16),
      addresses: tokenAddress,
    })
    .then((res) => res.data);
  var response = '';
  response += 'Chain Id: ' + chainId + '\n';
  response += 'Prices for tokens: ' + '\n';
  priceData.prices.map((x, i) => {
    response += x.token + ': ' + x.price + '\n';
  });
  return response;
};
