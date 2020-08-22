# guhrli-app

A library for fitbit **devices** to receive CGM data from various sources. Works in conjunction with the guhrli-companion and gurhli-settings libraries.

## Getting started

First, copy the library into the `app/` directory. Then inside `app/index.js`:
```js
    import { Guhrli } from './lib/gurhli-core-app'
    const guhrli = new Guhrli()
```

## The gurhli object

eg.
```js
    {
        reading: '186',
        alarm: 'HIGH',
        time: 1598111907021,
        isStale: false,
        formattedReading()
    }
```

## Alarms

guhrli.alarm can either be null (reading is in range) or have one of the following values:
```
    URGENT_HIGH,
    HIGH,
    LOW,
    URGENT_LOW
```

## Example usage

```js
    function onTick(evt) {
        ...
        updateReading()
        ...
    }

    ...

    function updateReading() {
        sgvText.text = gurhli.reading
        timeText.style.fill = colorMap[gurhli.alarm] || colorMap.default
        sgvAgeText.text = gurhli.formattedAge() || ''
    }

    const colorMap = {
        default: '#007700',
        URGENT_HIGH: '#800000',
        HIGH: '#ff9900',
        LOW: '#1ac6ff',
        URGENT_LOW: '#0000bb'
    }    
```

## Configuration

You can modify the library's behaviour be creating a `guhrli.config.js` file in the **project root** directory. Currently the only thing that can be configured is STALE_SGV_AGE

### Example guhrli.config.js

```js
    export const config = {
    'STALE_SGV_AGE': 5
    }
```