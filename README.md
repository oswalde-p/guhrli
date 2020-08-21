# guhrli - simple cgm monitor

![guhrli app screenshot on versa](screens/versa/Screenshot%202020-01-26%20at%2018.05.22.png?raw=true "BG in range")

## Features

* Display latest CGM reading from either:
    * Nightscout
    * Tomato
    * xDrip+ (coming soon)
* Clock colour changes with reading
    * In range -> green
    * High values -> red
    * Low values -> blue
    * For Nightscout, thresholds are read from the server
    * For Tomato, default values are used (setting coming soon)
* Minimal configuration
    * Units + alarm thresholds are read from source
* Second time zone
    * Toggle on/off and set the offset in the settings

## Getting started

1.  Install the app from the [Fitbit Gallery](https://gallery.fitbit.com/details/69cb39c2-2290-49de-b7e2-4223afea053d)
2.  Select your data source from the app Settings inside the Fitbit app
    1. If using Nightscout, enter your URL in the settings. *Don't* include `/api/v1`
    2. If using Tomato or xDrip+, see [below](#local-fetch-failing)
3. That's it! You should see readings appear in the corner of your watch. If not, see [troubleshooting](#troubleshooting)

## Known Issues

### Local Fetch Failing
Since v3.9 of the Fitbit app for Android, insecure requests are blocked, even on localhost. Follow the thread [here](https://community.fitbit.com/t5/SDK-Development/Fetch-API-stops-working-with-latest-Fitbit-PlayStore-App-v3-9-1-released-on/td-p/3883193). Hopefully this gets fixed in future updates, but for now you need to sideload an older version of the app. Google "fitbit android 3.8" ;)

## Troubleshooting

## Development

### Building + Installing
* run **npm install**
* make sure watch is connected to the Developer Bridge
* start fitbit console with **npx fitbit**
* build: **fitbit$ build**
* install: **fitbit$ install**
