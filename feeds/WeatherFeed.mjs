import { Feed } from './Feed.mjs'
import axios from 'axios'
import colors from 'colors/safe.js'

const WEATHER_UPDATE_INTERVAL = 60 * 60 * 1000 // hourly

class WeatherFeed extends Feed {
  constructor(apiKey) {
    super()
    this._weatherApiKey = apiKey
    this._name = 'Weather'
    this._status = 'UNKNOWN'

    this._weather = {
      temp: 'UNKNOWN',
      humidity: 'UNKNOWN',
      forecast: 'UNKNOWN',
      high: 'UNKNOWN',
      low: 'UNKNOWN',
    }

    this._updateWeatherData()

    setInterval(this.publish.bind(this), 15 * 1000)
    setInterval(this._updateWeatherData.bind(this), WEATHER_UPDATE_INTERVAL)
  }

  get data() {
    const { current, temp, humidity, forecast, high, low } = this._weather
    const lastUpdate = new Date(this._lastWeatherUpdate).toLocaleString(
      'en-us',
      { timeZone: 'America/Los_Angeles' },
    )

    return `Current: ${current}
Current Temp: ${temp}°
Humidity: ${humidity}%
Forecast: ${forecast}
High: ${high}°
Low: ${low}°
Last Updated: ${lastUpdate}`
  }

  get status() {
    // if we haven't updated the weather in 1hr 1min, then something is screwy
    if (
      !this._lastWeatherUpdate ||
      Date.now() - WEATHER_UPDATE_INTERVAL - 60000 > this._lastWeatherUpdate
    ) {
      return colors.red('ERROR')
    } else {
      return colors.green('OK')
    }
  }

  async _updateWeatherData() {
    const url = 'https://api.openweathermap.org/data/3.0/onecall'
    const queryParams = {
      lat: '45.5391889',
      lon: '-123.1297613',
      appid: this._weatherApiKey,
      units: 'imperial',
      exclude: 'minutely',
    }

    try {
      const weather = await axios.get(url, {
        params: queryParams,
      })

      this._weather = {
        current: weather.data.current.weather[0].description,
        temp: Math.round(weather.data.current.temp),
        humidity: weather.data.current.humidity,
        forecast: weather.data.daily[0].summary,
        high: Math.round(weather.data.daily[0].temp.max),
        low: Math.round(weather.data.daily[0].temp.min),
      }
      this._lastWeatherUpdate = Date.now()
      this.publish()
    } catch (e) {
      console.error('Error retreiving weather')
      console.error(e.message)
    }
  }
}

export { WeatherFeed }
