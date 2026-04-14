/**
 * Asynchronous presentation hook bridging Map Leaflet components with the remote Geocoding Service.
 * Implements an `isMounted` execution lock pattern to safely guard state mutations against React Strict Mode
 * or rapid unmounts during slow OpenStreetMap API coordinate translations.
 * 
 * @param {string} address The raw unverified street address text.
 * @param {number} safeLat Default fallback geographic latitude.
 * @param {number} safeLng Default fallback geographic longitude.
 * @param {string} popupText Text to display on the interactive map marker.
 * @param {string} notFoundText Renderable error fallback string.
 * @returns {Object} Tuple state bindings: `[position, currentPopup, isLoading]`.
 */
import { useState, useEffect } from 'react';
import { fetchCoordinatesByAddress } from '../services/geocoding.service';

export function useGeocoding(address, safeLat, safeLng, popupText, notFoundText) {
  const [position, setPosition] = useState([safeLat, safeLng]);
  const [currentPopup, setCurrentPopup] = useState(popupText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAddress = async () => {
      if (!address) {
        if (isMounted) {
          setPosition([safeLat, safeLng]);
          setCurrentPopup(popupText || 'הכתובת לא נמצאה');
        }
        return;
      }

      setIsLoading(true);
      try {
        const coords = await fetchCoordinatesByAddress(address);
        
        if (isMounted) {
          setPosition([coords.lat, coords.lon]);
          setCurrentPopup(address);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        if (isMounted) {
          setPosition([safeLat, safeLng]);
          setCurrentPopup(notFoundText || 'שגיאה בחיפוש הכתובת / Error finding address');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAddress();

    return () => {
      isMounted = false;
    };
  }, [address, safeLat, safeLng, popupText, notFoundText]);

  return { position, currentPopup, isLoading };
}
