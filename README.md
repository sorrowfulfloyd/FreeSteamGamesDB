#FreeSteamGamesDB

Scans the /json/steamDB.json file that, I pulled directly from the Steam API, does the usual checks and saves the free games into _'foundgames.txt'._ And the _'index.txt'_ is here for keeping track of the current iteration of appID in 'steamDB.json' so you don't lose your last position when you restart the script.

Due to Steam API limiting the calls to something like 200 per 5 minutes, I also implemented a quick and dirty solution to wait for 2 minutes and then try again, it can be further tweaked, if needed.
