import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

const BUTTON_ID = "MainContent_linkBtnContinue";
const BUTTON_REFRESH_ID = "MainContent_linkBtnRefresh";
const INPUT_NAME_TERMINAL_FROM = "ctl00$MainContent$dlFromTermList";
const INPUT_NAME_TERMINAL_TO = "ctl00$MainContent$dlToTermList";
const INPUT_NAME_LENGTH = "ctl00$MainContent$dlVehicle";
const INPUT_NAME_HEIGHT = "ctl00$MainContent$ddlCarTruck14To22";
const INPUT_NAME_DATE = "ctl00$MainContent$txtDatePicker";
const TABLE_ID = "MainContent_gvschedule";
const TARGET: string = "https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/SailingSchedule.aspx";

const LOOP_WAIT_MINS = 5;

/**
 * TODO
 * - run loop
 * - emails
 * - date time
 * - headless
 * - remove sleep
 */
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

type Listing = {
  time: Date;
  available: boolean;
}

const STR_IS_AVAILABLE = "Space Available";

const init = async (browser: Browser): Promise<WebDriver> =>  {
  return await new Builder().forBrowser(browser).build();
};

const run = async (browser: Browser) => {
  const driver = await init(browser);
  const running = true;

  const date = new Date("2021-09-18");

  console.log("Searching for reservations on day", date, date.toLocaleDateString("en-US"));

  try {
    await driver.get(TARGET);
    await populateForm(
      driver,
      Landing.ANACORTES,
      Landing.ORCAS_ISLAND,
      date,
      VehicleLength.REGULAR,
      VehicleHeight.SHORT
    );

    while(running) {
      await parseTable(driver, date);
      await sleep(1000 * 60 * LOOP_WAIT_MINS)
      await refreshForm(driver);
    }

  } finally {
    // await driver.quit();
  }
}

const sleep = async (ms: number = 500) => {
  await new Promise(r => setTimeout(r, ms));
};

const select = async (driver: WebDriver, name: string, value: string | number) => {
  const select = await driver.findElement(By.name(name));
  select.click();
  select.findElement(By.css(`option[value='${value}']`)).click();
  await sleep();
};

const parseTable = async (driver: WebDriver, date: Date) => {
  await sleep();
  const table = await driver.findElement(By.id(TABLE_ID));
  if (!table) {
    console.log("Failed to find schedule...");
    return;
  }
  const map = [];

  const rows = await table.findElements(By.tagName("tr"));

  for (let r = 0; r < rows.length; r++) {
    const elements = await rows[r].findElements(By.tagName("td"))
    if (!elements || elements.length === 0) continue;

    const timeText = await elements[1]?.getText();
    const availText = await elements[2]?.getText();

    const time = parseTime(timeText, date);
    const available = availText.trim() === STR_IS_AVAILABLE;
  
    const timeStr = time.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const entry = { time, available };
    map.push(entry);
    console.log(`- Found entry [${timeStr}]: ${available ? "" : "not "}available`);
  }
  console.log(`Map`, map);
};

const parseTime = (str: string, date: Date) => {
  const d = new Date(date.getTime());
  const time = str.toLowerCase().match( /(\d+)(?::(\d\d))?\s*(p?)/);
  if (!time) return date;

  const hours = parseInt(time[1]) + (time[3] ? 12 : 0);
  const mins = parseInt(time[2]) || 0;
  d.setHours(hours, mins);
  return d;
}


const populateForm = async (driver: WebDriver, from: Landing, to: Landing, date: Date, length: VehicleLength, height: VehicleHeight) => {
  await select(driver, INPUT_NAME_TERMINAL_FROM, from);
  await select(driver, INPUT_NAME_TERMINAL_TO, to);
  await select(driver, INPUT_NAME_LENGTH, length);
  await select(driver, INPUT_NAME_HEIGHT, height);
  
  // Do not use sendkeys, use executeScript to set value to bypass input validation onChange
  await driver.executeScript(`document.getElementsByName("${INPUT_NAME_DATE}")[0].value="${date.toLocaleDateString("en-US")}"`)
  await sleep();
    
  await driver.findElement(By.id(BUTTON_ID)).click();
  await sleep();
}

const refreshForm = async (driver: WebDriver) => {
  const btn = await driver.findElement(By.id(BUTTON_REFRESH_ID));
  if (!btn) {
    console.log("Failed to find refresh button");
    return;
  }
  btn.click()
  await sleep();
}


run(Browser.CHROME);