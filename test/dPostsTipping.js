const { assert } = require('chai');

const DPostsTipping = artifacts.require('./DPostsTipping');

require('chai').use(require('chai-as-promised')).should();

contract('DPostsTipping', ([deployer, author, tipper]) => {

  let dPostsTipping;
  before(async () => {
    dPostsTipping = await DPostsTipping.deployed();
  });

  describe('deployment', async () => {
    it('deployed successfully', async () => {
      const address = dPostsTipping.address;
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
    })
  })

  describe('Images', async () => {

    const hash = '123';
    let result, imageCount;

    before(async () => {
      result = await dPostsTipping.uploadImage(hash, 'loading test image', {from: author});
      imageCount = await dPostsTipping.imageCount();
    });

    it('upload image', async () => {
      const image = await dPostsTipping.images(imageCount);
      const event = result.logs[0].args;
      assert.equal(imageCount, 1);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'image count should be equal to 1');
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'event image count should be equal to 1');
      assert.equal(event.hash, hash, 'hash is not correct');
      assert.equal(event.description, 'loading test image', 'description is not correct');
      assert.equal(event.tipAmount, 0, 'tipAmount is not correct');
      assert.equal(event.author, author, 'author is not correct');

      await dPostsTipping.uploadImage('', 'loading test image', {from: author}).should.be.rejected;
      await dPostsTipping.uploadImage(hash, '', {from: author}).should.be.rejected;
    })

    it('list images', async () => {
      const image = await dPostsTipping.images(imageCount);
      assert.equal(imageCount, 1);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'image count should be equal to 1');
      assert.equal(image.hash, hash, 'hash is not correct');
      assert.equal(image.description, 'loading test image', 'description is not correct');
      assert.equal(image.tipAmount, 0, 'tipAmount is not correct');
      assert.equal(image.author, author, 'author is not correct');
    });

    it('tip author', async () => {
      let oldBalance = await web3.eth.getBalance(author);
      oldBalance = new web3.utils.BN(oldBalance);

      await dPostsTipping.tipImageOwner(imageCount, {from: tipper, value: web3.utils.toWei('1', 'ether')});
      const image = await dPostsTipping.images(imageCount);
      assert.equal(image.tipAmount, '1000000000000000000', 'tipAmount is not correct');
      assert.equal(image.author, author, 'author is not correct');

      let newBalance = await web3.eth.getBalance(author);
      newBalance = new web3.utils.BN(newBalance);

      let tipBalance = new web3.utils.BN(image.tipAmount); 
      tipBalance = oldBalance.add(tipBalance);

      // Check Author new balance
      assert.equal(newBalance.toString(), tipBalance.toString());

      // Try to tip image that do not exists
      await dPostsTipping.tipImageOwner(100, {from: tipper, value: web3.utils.toWei('1', 'ether')}).should.be.rejected;
    });
  })

})