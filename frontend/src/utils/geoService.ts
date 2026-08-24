import { City } from '../types';

export interface GeolocationResult {
  city: City;
  locality: string;
  formattedAddress: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  isNewCity?: boolean;
}

// Calculate Haversine distance in km between two lat/lon points
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest city in our database by distance
export function findClosestCity(lat: number, lon: number, cities: City[]): { city: City; distanceKm: number } {
  let closest = cities[0];
  let minDistance = Infinity;

  for (const c of cities) {
    if (c.lat && c.lng) {
      const dist = calculateDistanceKm(lat, lon, c.lat, c.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = c;
      }
    }
  }

  return { city: closest, distanceKm: minDistance };
}

// Reverse Geocode using free public endpoints
export async function reverseGeocode(lat: number, lon: number): Promise<{
  city?: string;
  locality?: string;
  suburb?: string;
  state?: string;
  pincode?: string;
  formattedAddress?: string;
}> {
  // Method 1: BigDataCloud Reverse Geocoding (Fast, accurate for India, CORS enabled)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const detectedCity = data.city || data.locality || data.principalSubdivision || '';
      const detectedLocality = data.locality || data.subLocality || data.neighbourhood || '';
      const detectedState = data.principalSubdivision || '';
      const detectedPincode = data.postcode || '';

      const addressParts = [detectedLocality, detectedCity, detectedState].filter(Boolean);
      return {
        city: detectedCity,
        locality: detectedLocality,
        suburb: data.localityInfo?.administrative?.[3]?.name || '',
        state: detectedState,
        pincode: detectedPincode,
        formattedAddress: addressParts.join(', '),
      };
    }
  } catch {
    // Fallthrough to next method
  }

  // Method 2: OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const detectedCity = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || '';
      const detectedLocality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || '';
      const detectedState = addr.state || '';
      const detectedPincode = addr.postcode || '';

      const addressParts = [detectedLocality, detectedCity, detectedState].filter(Boolean);
      return {
        city: detectedCity,
        locality: detectedLocality,
        state: detectedState,
        pincode: detectedPincode,
        formattedAddress: data.display_name || addressParts.join(', '),
      };
    }
  } catch {
    // Ignore fallback
  }

  return {};
}

// Master function to detect user GPS location and map to existing or custom city/locality
export async function detectGPSLocation(availableCities: City[]): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported in this browser. Please select your city manually.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // Attempt online reverse geocoding
          const geo = await reverseGeocode(lat, lng);

          // Check if detected city matches any in availableCities
          const normalizedDetectedCity = (geo.city || '').toLowerCase().trim();
          let matchedCity = availableCities.find(
            (c) =>
              c.name.toLowerCase().includes(normalizedDetectedCity) ||
              normalizedDetectedCity.includes(c.name.toLowerCase()) ||
              c.id.toLowerCase() === normalizedDetectedCity
          );

          // If no direct name match, find closest city by coordinates distance
          const closest = findClosestCity(lat, lng, availableCities);

          // If reverse geocoding found a distinct city (e.g. user in Patna, Jaipur, etc.)
          let finalCity: City;
          let isNewCity = false;

          if (matchedCity) {
            finalCity = matchedCity;
          } else if (geo.city && geo.city.length > 2) {
            // Create a dynamic city entry for the user's location
            finalCity = {
              id: geo.city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: geo.city,
              state: geo.state || 'India',
              popular: false,
              lat,
              lng,
              localities: geo.locality ? [geo.locality, 'Main City Center'] : ['Main City Center'],
            };
            isNewCity = true;
          } else {
            // Fallback to mathematically closest city in DB
            finalCity = closest.city;
          }

          // Determine best locality name
          let localityName = geo.locality || geo.suburb || '';
          if (!localityName) {
            localityName = finalCity.localities?.[0] || 'Central Area';
          }

          // If locality not in city's list, add it
          if (!finalCity.localities.includes(localityName)) {
            finalCity.localities = [localityName, ...finalCity.localities];
          }

          const formattedAddress =
            geo.formattedAddress || `${localityName}, ${finalCity.name}${geo.state ? `, ${geo.state}` : ''}`;

          resolve({
            city: finalCity,
            locality: localityName,
            formattedAddress,
            pincode: geo.pincode,
            latitude: lat,
            longitude: lng,
            isNewCity,
          });
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to parse GPS location.'));
        }
      },
      (err) => {
        let message = 'Unable to retrieve your location.';
        if (err.code === 1) {
          message = 'Location permission was denied. Please allow location access in your browser or select city manually.';
        } else if (err.code === 2) {
          message = 'Location information is currently unavailable.';
        } else if (err.code === 3) {
          message = 'Location request timed out. Please try again or select city manually.';
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
