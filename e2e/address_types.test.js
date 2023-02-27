const { log } = require('detox');

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // await device.reloadReactNative();
  });

  it('loads my test wallet', async () => {
    // let newWalletButton  element(by.text('CREATE NEW WALLET (NEW SEED)'));
    await element(by.id("loadingapp.restorewalletseed")).tap();
    await element(by.id("seed.seedplaceholder")).replaceText('lottery multiply patient simple ivory leisure swift square west despair beauty match crowd margin reject box always title photo remind word diet ecology badge');
    await element(by.id("birthdayinput")).replaceText('1994579');
    await element(by.text("RESTORE WALLET")).tap();
  });

  it('generates a u-address', async () => {
    // await element(by.id("receive tab")).tap();
  });
});
