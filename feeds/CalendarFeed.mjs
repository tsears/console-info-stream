import { Feed } from './Feed.mjs'
import fs from 'fs/promises'
import path from 'path'
import process from 'node:process'
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis'
import colors from 'colors/safe.js'

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')
const CALENDAR_UPDTATE_INTERVAL = 60 * 60 * 1000 // hourly
const CALENDARS = process.env.CALENDARS.split(',') || []

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

async function getEventsForCalendar(auth, calendarId) {
  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const today = now.toISOString()
  const tomorrowDate = new Date()
  tomorrowDate.setDate(now.getDate() + 1)
  tomorrowDate.setHours(0, 0, 0, 0)
  const tomorrow = tomorrowDate.toISOString()

  const res = await calendar.events.list({
    calendarId,
    timeMin: today,
    timeMax: tomorrow,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return res.data.items
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export async function listEvents(auth) {
  const events = await Promise.all(
    CALENDARS.map((calendarId) => getEventsForCalendar(auth, calendarId)),
  )

  const allEvents = events.flat()

  return allEvents.map((event, i) => {
    const allDay = !event.start.dateTime
    const start = event.start.dateTime || event.start.date
    return {
      time: start,
      summary: event.summary,
      allDay,
    }
  })
}

authorize().then(listEvents).catch(console.error)

class CalendarFeed extends Feed {
  constructor() {
    super()
    this._name = 'Calendar'
    this._status = 'OK'
    this._events = []
    this._lastUpdated = 'UNKNOWN'

    authorize().then((auth) => {
      this.auth = auth
      this._updateCalendarData()
      setInterval(this.publish.bind(this), 15 * 1000)
      setInterval(
        this._updateCalendarData.bind(this),
        CALENDAR_UPDTATE_INTERVAL,
      )
    })
  }

  get data() {
    const allDayEvents = this._events.filter((e) => e.allDay)
    const timedEvents = this._events.filter((e) => !e.allDay)

    const allDayEventsString = allDayEvents.map((e) => e.summary).join('\n')
    const timedEventsString = timedEvents
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((e) => {
        const formattedTime = new Date(e.time).toLocaleTimeString('en-us', {
          timeZone: 'America/Los_Angeles',
          timeStyle: 'short',
          hour12: false,
        })

        return `${colors.brightCyan(formattedTime)} - ${e.summary}`
      })
      .join('\n')

    return `${colors.yellow.underline('All Day')}\n${allDayEventsString}\n\n${colors.yellow.underline('Scheduled')}\n${timedEventsString}\n\nLast Updated: ${this._lastUpdated}`
  }

  async _updateCalendarData() {
    try {
      const events = await listEvents(this.auth)
      this._events = events
      this._status = 'OK'
      this._lastUpdated = new Date().toLocaleString('en-us', {
        timeZone: 'America/Los_Angeles',
      })
    } catch (e) {
      console.error('Error retreiving calendar events')
      console.error(e.message)
      this._status = 'ERROR'
    }
  }
}

export { CalendarFeed }
