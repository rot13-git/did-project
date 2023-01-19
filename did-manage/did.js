const ION = require('@decentralized-identity/ion-tools')
const fs = require('fs').promises


const createDid = async () => {
    console.log('Generating a Ed25519 key pair');
    const authnKeys = await ION.generateKeyPair('Ed25519');
  
    console.log('Creating a DID with the public JWK');
    const did = new ION.DID({
      content: {
        publicKeys: [
          {
            id: 'auth-keys',
            type: 'Ed25519VerificationKey2020',
            publicKeyJwk: authnKeys.publicJwk,
            purposes: ['authentication']
          }
        ],
        services: [
            {
              id: "IdentityHub",
              type: "IdentityHub",
              serviceEndpoint: {
                "@context": "schema.identity.foundation/hub",
                "@type": "UserServiceEndpoint",
                instance: [
                  "did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q",
                ]
              }
            }
          ]
      }
    });
  
    console.log('Generating a request to anchor the DID on chain');
    let requestBody = await did.generateRequest(0);
  
    console.log('Anchoring the DID on chain')
    const request = new ION.AnchorRequest(requestBody);
    let createResponse = await request.submit();
    console.log(createResponse)
  
    const shortFormURI = await did.getURI('short');
  
    fs.writeFile(
      'did.txt',
      `Short Form DID: 
    ${shortFormURI}
  Private JWK:
    ${JSON.stringify(authnKeys.privateJwk)}
  Public JWK:
    ${JSON.stringify(authnKeys.publicJwk)}`,
      function (err) {
        if (err) return console.log(err);
        console.log('Writing keys and DID to did.txt');
      }
    );
  };

createDid();