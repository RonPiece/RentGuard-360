/**
 * Service to handle geocoding using Nominatim OpenStreetMap API
 */

export async function fetchCoordinatesByAddress(address) {
  if (!address) {
    throw new Error('Address is required');
  }
  
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=il&q=${encodeURIComponent(address)}`);
  const data = await response.json();
  
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }
  
  throw new Error('Address not found');
}
