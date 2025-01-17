import React from 'react';
import { useState } from 'react';
import '../style/AuthPage.css';
import fetchData from '../utils/fetchData';
import QrCodeGenerator from './QrCode';
import { contractMap } from '../utils/maps';
import { reversedChainMap } from '../utils/maps';
const { ethers } = require('ethers');

const SignupComponent = ({ setIsSignup, setIsVerify }) => {
  const [isQRShown, setIsQRShown] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [adharNo, setAdharNo] = useState('');
  const [jsonData, setJsonData] = useState('');
  const credentialSchema = 'ipfs://Qmd5Emae7JaJCs4uELDbPptbAFutyXHqaC6M2dBqX1nadf';

  // helper functions
  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value);
  };
  const handleAdharNoChange = (event) => {
    setAdharNo(event.target.value);
  };
  const isValidUri = (uri) => {
    const uriPattern = /^did:polygonid:polygon:mumbai:[a-zA-Z0-9]+$/;
    return uriPattern.test(uri);
  };
  const isValidAdharno = (AdharNo) => {
    const aadharPattern = /^[2-9]\d{3}\s\d{4}\s\d{4}$/;
    return aadharPattern.test(AdharNo);
  };

  async function send() {
    const chainId = window.ethereum.networkVersion;
    console.log(chainId);
    const chain = '0x' + parseInt(chainId).toString(16);
    console.log(chainId.toString(16));
    console.log(chain);
    const chainname = reversedChainMap.get(chain);
    console.log(chainname);
    const contractAddress = contractMap.get(chainname).Signup;
    console.log(contractAddress);
    var Accounts = [];
    const userAccounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    Accounts = userAccounts;
    const functionSignature = 'signUp(string)';
    const functionSelector = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes(functionSignature))
      .slice(0, 10);
    const argument = ethers.utils.defaultAbiCoder.encode(['string'], [identifier]);
    const encodedData = functionSelector + argument.slice(2);
    if (Accounts.length > 0) {
      const gasLimit = await window.ethereum.request({
        method: 'eth_gasPrice',
        params: [],
      });
      console.log(parseInt(gasLimit.slice(2), 16));
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: Accounts[0],
            to: contractAddress,
            value: 0,
            gasPrice: gasLimit,
            data: encodedData,
          },
        ],
      });
      return txHash;
    }
  }
  const handleSignup = async () => {
    console.log('pressed');
    if (isValidAdharno(adharNo) && isValidUri(identifier)) {
      console.log('valid');
      let listCredentials = null;
      var hash = await send();

      if (hash !== null) {
        // let exists = false;
        try {
          // get the active Credentials to check already logged-in or not
          listCredentials = await fetchData('/v1/credentials', 'GET', null, {
            did: identifier,
            status: 'all',
          });
        } catch (e) {
          console.log('Error in fetching : ', e);
          return;
        }

        // listCredentials.forEach((e) => {
        //   if (e['schemaUrl'] === credentialSchema && e['expired'] == false && e['revoked'] == false) {
        //     exists = true;
        //   }
        // });

        // if(exists) {
        //     // handle on exit
        //     return
        // }

        // if not exist then create new credential and show QR code
        let id = null;
        try {
          id = await fetchData('/v1/credentials', 'POST', {
            credentialSchema: credentialSchema,
            type: 'adharkyc',
            credentialSubject: {
              // id: identifier,
              AdharNo: adharNo,
            },
            expiration: '2024-12-10T05:02:26.416Z',
            signatureProof: true,
            mtProof: true,
          });
          console.log('hello');
        } catch (e) {
          console.log('Error in Creating Credentials : ', e);
          return;
        }

        if (!id['id']) {
          // handle failure
          console.log('Failed to create Credentials');
          return;
        }
        console.log('Credentials created : ', id);

        let QRResponse = null;

        try {
          QRResponse = await fetchData(
            '/v1/credentials/' + id['id'] + '/qrcode',
            'GET',
            null,
            null,
          );
        } catch (e) {
          console.log('Failed to get QR : ', e);
          return;
        }

        console.log(QRResponse);

        if (!QRResponse['qrCodeLink']) {
          console.log('Failed to get QR');
          return;
        }

        console.log('QRResponse', QRResponse);
        setJsonData(QRResponse);
        setIsQRShown(true);
      }
    }
  };

  // close signup popup
  const closeSignupPopup = () => {
    setIsSignup(false);
  };

  return (
    <>
      <div
        className="SignUpMain"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        {!isQRShown ? (
          <div
            className="formcontainer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <div className="inputContainer">
              <label htmlFor="identifier" style={{ color: 'ivory' }}>
                Identifier:
              </label>
              <input
                type="text"
                id="identifier"
                placeholder="did:polygonid:polygon:mumbai:xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={identifier}
                style={{
                  width: '30vw',
                  backgroundColor: 'lightgray',
                  color: 'black',
                }}
                onChange={handleIdentifierChange}
              />
            </div>

            <div className="inputContainer">
              <label htmlFor="adharNo" style={{ color: 'ivory' }}>
                Adhar No:
              </label>
              <input
                type="text"
                id="adharNo"
                placeholder="XXXX XXXX XXXX"
                value={adharNo}
                // give width of 70%
                style={{
                  width: '30vw',
                  backgroundColor: 'lightgray',
                  color: 'black',
                }}
                onChange={handleAdharNoChange}
              />
            </div>

            <div
              className="but"
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <button onClick={handleSignup} className="button">
                Submit
              </button>
              <button onClick={closeSignupPopup} className="button">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="QrContainer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <QrCodeGenerator jsonData={jsonData} />
          </div>
        )}

        <div>
          <br></br>
          <button
            className="button"
            onClick={() => {
              setIsSignup(false);
              setIsVerify(true);
            }}
          >
            Continue to Verify
          </button>
        </div>
      </div>
    </>
  );
};

export default SignupComponent;
