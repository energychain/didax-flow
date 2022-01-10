const Lib = require("../lib.js");
var assert = require('assert');

describe('Core', function() {
  it('input JWT', async () => {
    const lib = new Lib();

    let jwt = null;

    // Requires JWT
    await assert.rejects(
      async () => {
          await lib.processDID(jwt);
      },
      Error
    );

    // missing JWT
    await assert.rejects(
      async () => {
          await lib.processDID();
      },
      Error
    );

    // Invalid String
    jwt = 'Hello World';
    await assert.rejects(
      async () => {
          await lib.processDID(jwt);
      },
      Error
    );
    return;
  });
  it('Output JWT', async () => {
    const lib = new Lib();

    let object = null;

    // Requires object
    await assert.rejects(
      async () => {
          await lib.toJWT(object);
      },
      Error
    );

    object = {};
    // Empty object => Signed JWT without Payload
    let jwt = await lib.toJWT(object);
    assert.equal(jwt.substr(0,2), 'ey');
    return;
  });
  it('Connect Output JWT with Input', async () => {
    const lib = new Lib();
    let object = {};
    let jwt = await lib.toJWT(object);
    let did = await lib.processDID(jwt);
    assert.equal(did.payload.iss, lib.id); // Should be Identity of our Lib
    assert.equal(did.issuer, lib.id);
  });
  it('addOffer', async () => {
    const lib = new Lib();
    const Offer = function() {
      return {
        bid: {
            minQuantity:1,
            totalQuantity:1,
            definition: {
              schema:"./test/schema.apple.json",
              asset:"./test/test.apple.json"
            }
        },
        ask: {
          minQuantity:1,
          definition: {
            schema:"./test/schema.pear.json",
            requirement:"./test/schema.pear.json"
          }
        },
        ratio:1,
        issuer:"1337",
        validUntil:new Date().getTime() + 86400000
      }
    }
    let jwt = await lib.toJWT(Offer());
    let did = await lib.processDID(jwt);
    assert.equal(did.payload.iss, lib.id); // Should be Identity of our Lib
    assert.equal(did.issuer, lib.id);
    console.log(did);

  });
});
