/**
 * California Locations Utility
 * Shared across BizBot, KiddoBot, WaterBot
 *
 * Usage:
 *   import { CA_COUNTIES, getCitiesForCounty, getCountyForCity } from './california-locations.js'
 */

import locationsData from './california-locations.json'

// Export the raw data
export const CA_LOCATIONS = locationsData

// Sorted list of all 58 counties
export const CA_COUNTIES = Object.keys(locationsData.counties).sort()

// Get cities for a given county (returns sorted array)
export function getCitiesForCounty(county) {
  const countyData = locationsData.counties[county]
  if (!countyData) return []
  return [...countyData.cities].sort()
}

// Get county for a given city (case-insensitive search)
export function getCountyForCity(cityName) {
  const searchName = cityName.toLowerCase().trim()

  for (const [county, data] of Object.entries(locationsData.counties)) {
    const found = data.cities.find(c => c.toLowerCase() === searchName)
    if (found) return county
  }
  return null
}

// Get population for a county
export function getCountyPopulation(county) {
  return locationsData.counties[county]?.population || null
}

// Check if a county exists
export function isValidCounty(county) {
  return county in locationsData.counties
}

// Check if a city exists in a given county
export function isValidCityInCounty(city, county) {
  const cities = getCitiesForCounty(county)
  return cities.some(c => c.toLowerCase() === city.toLowerCase().trim())
}

// Get all cities (flattened, sorted)
export function getAllCities() {
  const allCities = []
  for (const data of Object.values(locationsData.counties)) {
    allCities.push(...data.cities)
  }
  return [...new Set(allCities)].sort()
}

// Search cities by partial name (for autocomplete)
export function searchCities(query, limit = 10) {
  const searchTerm = query.toLowerCase().trim()
  if (!searchTerm) return []

  const results = []
  for (const [county, data] of Object.entries(locationsData.counties)) {
    for (const city of data.cities) {
      if (city.toLowerCase().includes(searchTerm)) {
        results.push({ city, county })
        if (results.length >= limit) return results
      }
    }
  }
  return results
}

// For React components: formatted options for dropdowns
export function getCountyOptions() {
  return CA_COUNTIES.map(county => ({
    value: county,
    label: `${county} County`
  }))
}

export function getCityOptions(county) {
  const cities = getCitiesForCounty(county)
  if (cities.length === 0) {
    return [{ value: '__manual__', label: 'Enter city manually' }]
  }
  return [
    ...cities.map(city => ({ value: city, label: city })),
    { value: '__manual__', label: 'Other / Unincorporated' }
  ]
}

// Default export for convenience
export default {
  CA_COUNTIES,
  CA_LOCATIONS,
  getCitiesForCounty,
  getCountyForCity,
  getCountyPopulation,
  isValidCounty,
  isValidCityInCounty,
  getAllCities,
  searchCities,
  getCountyOptions,
  getCityOptions
}
