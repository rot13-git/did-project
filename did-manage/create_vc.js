const ION = require('@decentralized-identity/ion-tools')
const fs = require('fs').promises


const main = async () => {
    const privateKey = JSON.parse(await fs.readFile('privateKey.json'))
    const personalData = 'Esempio di messaggio'
    const signature = await ION.signJws({
        payload: personalData,
        privateJwk: privateKey
    });
    console.log("Signed JWS:", signature);

    const randomKeyPair = await ION.generateKeyPair('secp256k1')
    let verifiedJws = await ION.verifyJws({
    jws: signature,
    publicJwk: randomKeyPair.publicJwk
    })
    console.log("Verifica con chiave random:", verifiedJws)

    const publicKey = JSON.parse(await fs.readFile('publicKey.json'))
    verifiedJws = await ION.verifyJws({
    jws: signature,
    publicJwk: publicKey
    })
    console.log("Verifica con chiave pubblica:", verifiedJws)
}

main()