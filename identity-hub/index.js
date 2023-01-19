var express = require('express')
var fetch = import('node-fetch')
var fs = require('fs')

var Hub = require('@decentralized-identity/hub-node-core')
var hubMongo = require('@microsoft/hub-mongo-connector')
var didCommon = require('@decentralized-identity/did-common-typescript')
var didAuth = require('@decentralized-identity/did-auth-jose')

const universalResolverUrl = 'https://beta.discover.did.microsoft.com'
const privateKeyFilePath = './private.jwk'
const mongoUrl = 'mongodb://127.0.0.1:27017'

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
      const hubPrivateKey = {["auth-keys"]: didAuth.EdPrivateKey.wrapJwk("auth-keys",privateJwk)}
      const hubCryptoSuites = [new didAuth.RsaCryptoSuite(), new didAuth.AesCryptoSuite(), new didAuth.Secp256k1CryptoSuite()]

      console.log(privateJwk)
      //const hubPrivateKey = {["auth-keys"]:}

      var hub = new Hub.default({
        store: mongoStore,
        resolver: new didCommon.HttpResolver({ fetch: fetch, resolverUrl: universalResolverUrl}),
        keys: hubPrivateKey,
        cryptoSuites: hubCryptoSuites
      })

      app.post('/', async function (req, res) {
          
      })


      app.listen(port, () => console.log(`Identity hub running on port ${port}`))
}

runHub();
