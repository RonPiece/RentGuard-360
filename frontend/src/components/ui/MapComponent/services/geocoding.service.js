/**
 * Service to handle geocoding using Nominatim OpenStreetMap API
 */

import { getBestMatch } from '../utils/geocodingUtils';

export async function fetchCoordinatesByAddress(address) {
  if (!address) {
    throw new Error('Address is required');
  }

  let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&addressdetails=1&q=${encodeURIComponent(address)}`);
  let data = await response.json();

  let bestMatch = getBestMatch(data, address);
  if (bestMatch) {
    return { lat: parseFloat(bestMatch.lat), lon: parseFloat(bestMatch.lon) };  
  }

  const noCommasAddress = address.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (noCommasAddress !== address) {
    response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&addressdetails=1&q=${encodeURIComponent(noCommasAddress)}`); 
    data = await response.json();

    bestMatch = getBestMatch(data, noCommasAddress);
    if (bestMatch) {
      return { lat: parseFloat(bestMatch.lat), lon: parseFloat(bestMatch.lon) };
    }
  }

  const noNumbersAddress = address.replace(/\d+/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (noNumbersAddress && noNumbersAddress !== noCommasAddress && noNumbersAddress !== address) {
    response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&addressdetails=1&q=${encodeURIComponent(noNumbersAddress)}`);
    data = await response.json();

    bestMatch = getBestMatch(data, noNumbersAddress);
    if (bestMatch) {
      return { lat: parseFloat(bestMatch.lat), lon: parseFloat(bestMatch.lon) };
    }
  }

  throw new Error('Address not found');
}
