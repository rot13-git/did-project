var fsp = require('fs').promises;
var fs = require('fs');
//var didAuth = require('@decentralized-identity/did-auth-jose');
const ION = require('@decentralized-identity/ion-tools')
var http = require('https');

const KEY_ID = "key-1";

var privateJwk;
var publicJwk;
const createDid = async () => {
    if(!fs.existsSync("privateKey.json")) {
        console.log("[+] Creating HUB key pair")
        const authnKeys = await ION.generateKeyPair('Ed25519')
        await fsp.writeFile('publicKey.json',JSON.stringify(authnKeys.publicJwk))
        await fsp.writeFile('privateKey.json',JSON.stringify(authnKeys.privateJwk))
        console.log(authnKeys.publicJwk) 
        console.log(authnKeys.privateJwk)
    }else{
        privateJwk = JSON.parse(await fsp.readFile('privateKey.json'));
        publicJwk = JSON.parse(await fsp.readFile('publicKey.json'));
    }
    console.log("[+] Inizio creazione DID")
    const did = new ION.DID({
        content:{
            publicKeys: [
                {
                  id: 'auth-keys',
                  type: 'Ed25519VerificationKey2020',
                  publicKeyJwk: publicJwk,
                  purposes: ['authentication']
                }
              ],
              services: [
                {
                id: "IdentityHub",
                type: "IdentityHub",
                serviceEndpoint: {
                  "@context": "https://schema.identity.foundation/1.0/hub",
                  "@type": "HostServiceEndpoint",
                  locations: ["http://localhost:8080"]
                }
              }]
        }
        
    }); 
    console.log('Generating a request to anchor the DID on chain');
    let requestBody = await did.generateRequest(0);
  
    console.log('Anchoring the DID on chain')
    const request = new ION.AnchorRequest(requestBody);
    let createResponse = await request.submit();
    console.log(createResponse)
  
    const shortFormURI = await did.getURI('short');
  
    console.log('[+] Created: ',shortFormURI)
}


async function registerDid() {

    try {

        privateJwk = JSON.parse(readFileSync('private.jwk', 'utf8'));
        privateJwk = didAuth.PrivateKeyRsa.wrapJwk(privateJwk.kid, privateJwk);
        publicJwk = privateJwk.getPublicKey();

    } catch (err) {

        // No private.jwk found
        privateJwk = await didAuth.PrivateKeyRsa.generatePrivateKey(KEY_ID);
        publicJwk = privateJwk.getPublicKey();

    }

    body = {
        didMethod: 'test',
        hubUri: 'http://localhost:8080',
        publicKey: [publicJwk],
    }

    const cryptoFactory = new didAuth.CryptoFactory([new didAuth.RsaCryptoSuite()]);
    const token = new didAuth.JwsToken(JSON.stringify(body), cryptoFactory);
    const signedRegistrationRequest = await token.sign(privateJwk);

    // An object of options to indicate where to post to
    var post_options = {
        host: 'https://beta.ion.msidentity.com',
        path: '/api/v1.0/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/jwt',
            'Content-Length': Buffer.byteLength(signedRegistrationRequest)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log(chunk);
            privateJwk.kid = `${JSON.parse(chunk).did}#${KEY_ID}`
            fs.writeFileSync('private.jwk', JSON.stringify(privateJwk), { encoding: 'utf8' });
        });
    });

    // post the data
    post_req.write(signedRegistrationRequest);
    post_req.end();
}

createDid();