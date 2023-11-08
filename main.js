import gameDB from "./json/steamDB.json" assert {type: 'json'};
import { writeFileSync, readFileSync, appendFileSync } from 'node:fs';

const API = "https://store.steampowered.com/api/appdetails?appids=";
const STOREADDRESS = 'https://store.steampowered.com/app/'
const GAME_DB_LENGTH = gameDB.applist.apps.length;
const INDEX = readFileSync('index.txt', 'utf-8')

function syncToFile(tempIndex) {
  try {
    let i = Number(INDEX) + tempIndex;

    writeFileSync('index.txt', String(i), 'utf-8');
    console.log(`[SAVED] Currently at ${i} of ${GAME_DB_LENGTH}...`)
  } catch (e) {
    console.log(`[ERROR] -> ${e}`);
  }
};

async function scanAppIDs(ID) {
  try {
    const response = await fetch(API + ID);

    if (!response.ok) {
      console.log(`\nNetwork denied the request. Reason: ${response.status} - ${response.statusText}\nRetrying in 2 minutes.`);
      await new Promise(resolve => setTimeout(resolve, 120000));
      return scanAppIDs(ID);
    }

    const returnedAppData = await response.json();

    const SUCCESS = returnedAppData[ID].success;
    if (!SUCCESS) { return console.log(`[${ID}] - is depricated/doesn't exist, skipping.`) }

    const CONTENT_TYPE = returnedAppData[ID].data.type;
    const GAME_NAME = returnedAppData[ID].data.name;
    const IS_FREE = returnedAppData[ID].data.is_free;

    if (CONTENT_TYPE == "game") {
      if (IS_FREE) {
        try {
          appendFileSync('./foundgames.txt', `\n${GAME_NAME}\t${STOREADDRESS}${ID}`, 'utf-8')
          return console.log(`[#${ID}] ${GAME_NAME} - is free! Saved to 'foundgames.txt'`)
        } catch (error) {
          console.log(`[ERROR] - Couldn't save the free game I've found. -> ${error}`)
        }
      }
      else { return console.log(`[#${ID}] ${GAME_NAME} - is a game but not free, skipping.`); }
    }
    else {
      return console.log(`[#${ID}] ${GAME_NAME} - isn't a game, skipping.`);
    }
  } catch (error) {
    console.log(`[ERROR] -> ${error}`);
  }
};

async function traverseDB() {
  let loc = Number(INDEX);
  let tempIndex = 1;

  if (loc < 1) console.log(`Couldn't find the last index... Starting all over again. ${loc} of ${GAME_DB_LENGTH}...`)
  console.log(`Firing up... Resuming the search. ${loc} of ${GAME_DB_LENGTH}...`)

  for (let i = loc; i < GAME_DB_LENGTH; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    syncToFile(tempIndex);
    ++tempIndex;
    await scanAppIDs(gameDB.applist.apps[i].appid);
  }
}

if (isNaN(INDEX)) { // Reset the counter to 0, if it someshow get's changed to 'undefined' or 'NaN'
  writeFileSync('index.txt', String(0), 'utf-8');
}

traverseDB();
