const EventEmitter = require('events');
const DidaxCore = require('didax-core');
const ethers = require("ethers");
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;
const EthrDID = require("ethr-did").EthrDID;
const EthCrypto = require('eth-crypto');

class DidaxFlow extends EventEmitter {
 constructor(config) {
   super();
   this.core = new DidaxCore(config);
   if((typeof config == "undefined")||(config == null)) {
     config = {};
   }

   if(typeof config.identity == 'undefined') {
      config.identity = EthrDID.createKeyPair();
   }

   if(typeof config.resolver == 'undefined') {
      config.resolver = {
        rpcUrl:"https://integration.corrently.io/",
        name: "mainnet",
        chainId: "6226",
        registry:"0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335"
      };
   }
   this.id = 'did:ethr:'+config.identity.publicKey

   this.processDID = async function(jwt) {
     if((typeof jwt !== 'string') || (jwt.substr(0,2) !== 'ey')) {
         throw new Error('JWT expected');
     }
     const didResolver = new Resolver(getResolver(config.resolver));
     const ethrDid = new EthrDID(config.identity);

     let did = await ethrDid.verifyJWT(jwt, didResolver);
     did.payload.issuer = did.issuer; // overwrite with real Resolution
     did.payload.id = ethers.utils.id(jwt);
    
     // validate based on given usecase
     try {
        await this.core.addOffer(did.payload);
     } catch(e) {
      //  console.log('Validation of DID',e);
     }
     return did;
   }

   this.offers = this.core.offers;

   this.toJWT = async function(object) {
     if((typeof object !== 'object')||(object == null)) {
       throw new Error('toJWT expects object');
     }
     const ethrDid = new EthrDID(config.identity);
     return await ethrDid.signJWT(object);
   }

 }
}

module.exports = DidaxFlow;
