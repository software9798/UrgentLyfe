export interface AddressObject {
  line1?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  landmark?: string;
}

/**
 * Formats a clean, readable destination address string for maps and display
 */
export function formatFullAddress(address?: AddressObject | string): string {
  if (!address) return 'Indiranagar, Bengaluru, Karnataka, 560038';
  if (typeof address === 'string') return address;

  const parts = [
    address.line1,
    address.landmark ? `(Near ${address.landmark})` : '',
    address.locality,
    address.city,
    address.pincode,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Generates universal Google Maps Turn-by-Turn Directions URL
 */
export function getGoogleMapsDirectionsUrl(
  destination: AddressObject | string,
  origin?: string
): string {
  const destQuery = typeof destination === 'string' ? destination : formatFullAddress(destination);
  const encodedDest = encodeURIComponent(destQuery);
  
  if (origin) {
    const encodedOrigin = encodeURIComponent(origin);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}&travelmode=driving`;
  }
  
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&travelmode=driving`;
}

/**
 * Generates Apple Maps Directions URL
 */
export function getAppleMapsDirectionsUrl(destination: AddressObject | string): string {
  const destQuery = typeof destination === 'string' ? destination : formatFullAddress(destination);
  return `https://maps.apple.com/?daddr=${encodeURIComponent(destQuery)}&dirflg=d`;
}

/**
 * Generates Waze Navigation URL
 */
export function getWazeDirectionsUrl(destination: AddressObject | string): string {
  const destQuery = typeof destination === 'string' ? destination : formatFullAddress(destination);
  return `https://waze.com/ul?q=${encodeURIComponent(destQuery)}&navigate=yes`;
}

/**
 * Opens One-Click Directions in the user's preferred navigation app (Google Maps default)
 */
export function openOneClickDirections(
  destination: AddressObject | string,
  origin?: string
): void {
  const url = getGoogleMapsDirectionsUrl(destination, origin);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Calculates estimated distance, duration, and simulated step-by-step route for navigation preview
 */
export function getEstimatedRouteDetails(
  destination: AddressObject | string,
  city = 'Bengaluru'
) {
  const destStr = typeof destination === 'string' ? destination : formatFullAddress(destination);
  
  // Deterministic calculation based on string hash for smooth, consistent estimates
  let hash = 0;
  for (let i = 0; i < destStr.length; i++) {
    hash = (hash << 5) - hash + destStr.charCodeAt(i);
    hash |= 0;
  }
  
  const distanceKm = Math.abs((hash % 45) / 10 + 2.5).toFixed(1); // 2.5 - 7.0 km
  const durationMins = Math.round(Number(distanceKm) * 3.2 + 4); // ~12 - 25 mins
  const trafficLevel: 'Light' | 'Moderate' | 'Heavy' =
    Math.abs(hash % 3) === 0 ? 'Light' : Math.abs(hash % 3) === 1 ? 'Moderate' : 'Heavy';

  const locality = typeof destination === 'object' && destination?.locality ? destination.locality : city;

  return {
    destination: destStr,
    distanceKm: `${distanceKm} km`,
    durationMins: `${durationMins} mins`,
    trafficLevel,
    originHub: `UrgentLyfe Express Center (${city})`,
    steps: [
      { instruction: 'Head east from UrgentLyfe Service Hub towards Main Ring Road', distance: '400 m' },
      { instruction: `Take flyover exit towards ${locality} Junction`, distance: '1.8 km' },
      { instruction: 'Turn right at the signal past the landmark', distance: '650 m' },
      { instruction: `Arrive at destination: ${destStr.slice(0, 45)}...`, distance: '100 m' },
    ],
  };
}
