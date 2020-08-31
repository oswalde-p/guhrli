# guhrli - simple cgm monitor

![guhrli app screenshot on versa](screens/versa/Screenshot%202020-01-26%20at%2018.05.22.png?raw=true "BG in range")

## Features

* Display latest CGM reading from either:
    * Nightscout
    * Tomato
    * xDrip+ (android only)
* Clock colour changes with reading
    * In range -> green
    * High values -> orange/red
    * Low values -> light/dark blue
* Minimal configuration
    * Units + alarm thresholds are read from source
* Second time zone
    * Toggle on/off and set the offset in the settings

## Getting started

1.  Install the app from the [Fitbit Gallery](https://gallery.fitbit.com/details/69cb39c2-2290-49de-b7e2-4223afea053d)
2.  Select your data source from the app Settings inside the Fitbit app
    1. If using Nightscout, enter your URL in the settings. *Don't* include `/api/v1`
3. That's it! You should see readings appear in the corner of your watch. If not, see [troubleshooting](#troubleshooting)

## Differences Between Sources

* **High/low thresholds:** Due to the different levels of detail available in each API, each source has slightly different behavior for
thresholds. Nightscout provides **4** levels (urgent low/low/high/urgent high) based on the user's settings. xDrip+ provides just 2 (low/high),
and so only 3 different colours will be used in the watch. Tomato provides no alarm information, so 4 hardcoded default thresholds are used.
* **Offline mode:** Only xDrip+ supports offline mode, meaning that results will still be updated on the watch when the phone has no internet
connection. A bluetooth connection between the phone and the watch is always needed.

## Troubleshooting
🚧 coming soon 🚧

In the meantime, you can contact me via the [app page]((https://gallery.fitbit.com/details/69cb39c2-2290-49de-b7e2-4223afea053d)) in the Fitbit
gallery.

## Development

### Building + Installing
* run **npm install**
* make sure watch is connected to the Developer Bridge
* start fitbit console with **npx fitbit**
* build: **fitbit$ build** (see below about building for production)
* install: **fitbit$ install**

### Building for Production
When creating a build for release, all tests need to run and pass. Therefore, this build should only be done using the build script:
```bash
    npm run build
```
which runs the tests before building the app. The resulting build is placed in the `build/` directory.
