const { ethers } = require('ethers');
export const callContractFunction = async (contractAddress, functionArgs, argsType, hash) => {
  var Accounts = [];
  const userAccounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  Accounts = userAccounts;
  const data = ethers.utils.defaultAbiCoder.encode(argsType, functionArgs);
  const encodedData = hash + data.slice(2);
  console.log(encodedData);
  if (Accounts.length === 0) {
    await getAccount();
  }
  if (Accounts.length > 0) {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: Accounts[0],
          to: contractAddress,
          value: 0,
          gasLimit: '0xffffffff',
          data: encodedData,
        },
      ],
    });
  }
};

const getAccount = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    Accounts = accounts;
  } catch (error) {
    console.error(error);
  }
};