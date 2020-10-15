import * as simpleSettings from './simple/companion-settings'
import { initialize, GuhrliError } from 'fitbit-guhrli-core/companion'

simpleSettings.initialize()
try {
  initialize()
} catch(err) {
  if (err instanceof GuhrliError) {
    console.error('Error initializing Guhrli companion')
    console.error(err)
  }
  throw (err)
}
