import { Builder, By, Key, until } from 'selenium-webdriver';

const TARGET: string = "https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/SailingSchedule.aspx";

enum Browser {
  SAFARI = "safari",
  FIREFOX = "firefox",
  CHROME = "chrome"
}

enum Landing {
  ANACORTES = 1,
  ORCAS_ISLAND = 15,
}

enum VehicleHeight {
  SHORT = 1000,
  MEDIUM = 1001,
  TALL = 6,
  OVERHEIGHT = 7,
}

enum VehicleLength {
  REGULAR = 3,
  LARGE = 4,
}


const init = async (browser: Browser) =>  {
  let driver = await new Builder().forBrowser(browser).build();
  try {
    await driver.get(TARGET);


  } finally {
    // await driver.quit();
  }
};

const populateForm = async (source: Landing, destination: Landing, date: Date, length: VehicleLength, height: VehicleHeight) => {
}


init(Browser.CHROME);