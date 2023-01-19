const ION = require('@decentralized-identity/ion-tools')
const fs = require('fs').promises


const main = async () => {
    console.log('\x1b[33m%s\x1b[0m',"[+] Recupero DID\n")
    const resolvedDid = await ION.resolve(
        'did:ion:EiDeey5xEYcYzzGaxH-NZRLeFJymRYxkdLlcIt04H90k7w'
    )
    console.log(resolvedDid)
    console.log('\x1b[33m%s\x1b[0m',"\n[+] Estrazione public key\n")
    console.log(resolvedDid.didDocument.verificationMethod[0].publicKeyJwk)
}

main()