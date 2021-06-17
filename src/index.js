import { Builder, By, Key, until } from 'selenium-webdriver';

const TARGET = "https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/SailingSchedule.aspx";
const init = async (browser) =>  {
  let driver = await new Builder().forBrowser(browser).build();
  try {
    await driver.get(TARGET);
  } finally {
    // await driver.quit();
  }
};


init('chrome');