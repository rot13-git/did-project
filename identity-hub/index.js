const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));
//const KeyStoreMem = require('@decentralized-identity/did-auth-jose/dist/lib/keyStore/IKeyStore');
var express = require('express')
var fs = require('fs')

var Hub = require('@decentralized-identity/hub-node-core')
var hubMongo = require('@microsoft/hub-mongo-connector')
var didCommon = require('@decentralized-identity/did-common-typescript')
var didAuth = require('@decentralized-identity/did-auth-jose')

const universalResolverUrl = 'https://beta.discover.did.microsoft.com/'
const privateKeyFilePath = './private.jwk'
const mongoUrl = 'mongodb://127.0.0.1:27017'
var HttpResolver = require ('@decentralized-identity/did-common-typescript');

async function runHub(){
    
    var app = express();
    const port = 8080;

    app.use(express.raw({
        inflate: true,
        limit: '500kb',
        type: 'application/jwt'
      }))
    
    mongoStore = new hubMongo.MongoDBStore({
        url: mongoUrl,
        databaseId: 'identity-hub',
        commitCollectionId: 'hub-commits',
        objectCollectionId: 'hub-objects',
      })
    
      await mongoStore.initialize() 
      const privateJwk = JSON.parse(fs.readFileSync("privateKey.json"));
      const hubPrivateKey = {["did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q#auth-keys"]: didAuth.EdPrivateKey.wrapJwk("did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q#auth-keys",privateJwk)}
      const hubCryptoSuites = [new didAuth.RsaCryptoSuite(), new didAuth.AesCryptoSuite(), new didAuth.Secp256k1CryptoSuite()]

      
      //const hubPrivateKey = {["auth-keys"]:}
      const keyStore = new didAuth.KeyStoreMem();
      keyStore.save(hubPrivateKey['did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q#auth-keys'].kid,hubPrivateKey['did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q#auth-keys']);
      
      console.log(hubPrivateKey);
      //console.log(keyStore.get("did:ion:EiCA_KXdKkqAvzvySX5GCHbWx5jq2gmtyAUN3d6WwlGt3Q#auth-keys"));
      var hub = new Hub.default({
        keyStore: keyStore,
        store: mongoStore,
        resolver: new didCommon.HttpResolver({fetch: fetch,resolverUrl:"https://beta.discover.did.microsoft.com/"}),
        keys: hubPrivateKey,
        cryptoSuites: hubCryptoSuites
      })

      app.post('/api/v1.0', async function (req, res) {
        try {
          console.log("richiesta ricevuta");
          var requestBuffer
          if (typeof req.body === 'string') {
            requestBuffer = Buffer.from(req.body)
          } else if (Buffer.isBuffer(req.body)) {
            requestBuffer = req.body
          } else {
            return res.status(400).json({
              error_code: 'UNSUPPORTED_CONTENT_TYPE',
              error_url: null,
              developer_message: 'Expected a buffer or a string in HTTP request body.',
              inner_error: {
                timestamp: new Date(Date.now()).toUTCString()
              }
            })
          }

          response = await hub.handleRequest(requestBuffer)

          return res.status(response.ok ? 200: 500).send(response.body);
      } catch(error){
        console.log(error);
      }

      })


      app.listen(port, () => console.log(`Identity hub running on port ${port}`))
}

runHub();
