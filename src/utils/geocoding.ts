import { restaurantConfig } from '../config/restaurantConfig';

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

// Kolkata neighborhoods, roads, & landmark coordinates for instant accurate distance calculation
const KOLKATA_LOCALITIES: Array<{ keywords: string[]; coords: GeoCoords }> = [
  { keywords: ['tanti bagan', 'tantibagan', 'tanti bagan lane'], coords: { latitude: 22.5428, longitude: 88.3712 } },
  { keywords: ['sundari mohan', 'dr sundari mohan', 'baba tea', 'linton post office'], coords: { latitude: 22.5463, longitude: 88.3688 } },
  { keywords: ['linton', 'linton st', 'linton street'], coords: { latitude: 22.5458, longitude: 88.3675 } },
  { keywords: ['cit road', 'cit rd'], coords: { latitude: 22.5482, longitude: 88.3678 } },
  { keywords: ['beniapukur'], coords: { latitude: 22.5440, longitude: 88.3690 } },
  { keywords: ['entally'], coords: { latitude: 22.5510, longitude: 88.3680 } },
  { keywords: ['park circus', 'seven point'], coords: { latitude: 22.5410, longitude: 88.3650 } },
  { keywords: ['mullick bazar', 'mallik bazar'], coords: { latitude: 22.5480, longitude: 88.3610 } },
  { keywords: ['park street', 'park st'], coords: { latitude: 22.5530, longitude: 88.3520 } },
  { keywords: ['camac street', 'camac st'], coords: { latitude: 22.5480, longitude: 88.3530 } },
  { keywords: ['ripon street', 'muzaffar ahmed'], coords: { latitude: 22.5540, longitude: 88.3580 } },
  { keywords: ['sealdah', 'sealdah station'], coords: { latitude: 22.5670, longitude: 88.3710 } },
  { keywords: ['esplanade', 'dharmatala', 'curzon park'], coords: { latitude: 22.5650, longitude: 88.3520 } },
  { keywords: ['chandni chowk', 'chandni'], coords: { latitude: 22.5680, longitude: 88.3560 } },
  { keywords: ['ballygunge', 'ballygunge phari'], coords: { latitude: 22.5280, longitude: 88.3650 } },
  { keywords: ['gariahat'], coords: { latitude: 22.5180, longitude: 88.3670 } },
  { keywords: ['jadavpur', '8b bus stand'], coords: { latitude: 22.4990, longitude: 88.3680 } },
  { keywords: ['golpark'], coords: { latitude: 22.5130, longitude: 88.3650 } },
  { keywords: ['dhakuria'], coords: { latitude: 22.5070, longitude: 88.3680 } },
  { keywords: ['kasba', 'ruby', 'ruby hospital'], coords: { latitude: 22.5150, longitude: 88.3970 } },
  { keywords: ['topsia'], coords: { latitude: 22.5380, longitude: 88.3880 } },
  { keywords: ['tangra', 'chinatown'], coords: { latitude: 22.5510, longitude: 88.3870 } },
  { keywords: ['sector v', 'sector 5', 'salt lake sector v', 'salt lake sec 5'], coords: { latitude: 22.5726, longitude: 88.4320 } },
  { keywords: ['salt lake', 'bidhannagar', 'karunamoyee'], coords: { latitude: 22.5800, longitude: 88.4170 } },
  { keywords: ['new town', 'rajarhat', 'action area'], coords: { latitude: 22.5850, longitude: 88.4710 } },
  { keywords: ['baguiati', 'vip road'], coords: { latitude: 22.6180, longitude: 88.4230 } },
  { keywords: ['dum dum', 'dumdum'], coords: { latitude: 22.6220, longitude: 88.3930 } },
  { keywords: ['ultadanga', 'hudco'], coords: { latitude: 22.5870, longitude: 88.3850 } },
  { keywords: ['kankurgachi'], coords: { latitude: 22.5780, longitude: 88.3860 } },
  { keywords: ['shyambazar', 'five point'], coords: { latitude: 22.6000, longitude: 88.3700 } },
  { keywords: ['howrah', 'howrah station'], coords: { latitude: 22.5840, longitude: 88.3430 } },
  { keywords: ['behala', 'manton', 'chowrasta'], coords: { latitude: 22.4970, longitude: 88.3180 } },
  { keywords: ['alipore', 'zoo'], coords: { latitude: 22.5330, longitude: 88.3330 } },
  { keywords: ['tollygunge', 'karunamoyee tolly'], coords: { latitude: 22.4930, longitude: 88.3480 } },
  { keywords: ['garia'], coords: { latitude: 22.4670, longitude: 88.3830 } },
];

/**
 * Geocodes a user-entered Kolkata address string into lat/lon coordinates.
 */
export async function geocodeKolkataAddress(addressStr: string): Promise<GeoCoords | null> {
  const clean = addressStr.trim().toLowerCase();
  if (!clean) return null;

  // 1. Check direct keyword match against Kolkata localities table first for fast accurate match
  for (const loc of KOLKATA_LOCALITIES) {
    if (loc.keywords.some((kw) => clean.includes(kw))) {
      return loc.coords;
    }
  }

  // Clean house numbers, flat numbers, and landmark prefaces for API searching
  const streetOnly = clean
    .replace(/^[\d]+\s*[\/\-]\s*[\d]*[a-zA-Z]?\s*,?\s*/, '')
    .replace(/^(flat|h\.?no|house|plot|holding|room|door|no\.?|building)\s*[\#\d\/\-a-zA-Z\d]+\s*,?\s*/gi, '')
    .replace(/^\d+[a-zA-Z]?\s*,?\s*/, '')
    .replace(/(near|opp|opposite|flat|room|h\.no|house no|above|behind)\s+[^,]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const queryVariants = Array.from(new Set([
    streetOnly,
    clean,
  ])).filter(Boolean);

  // 2. Try Photon API (OpenStreetMap geocoder with lat/lon proximity bias for Kolkata)
  for (const q of queryVariants) {
    try {
      const fullQ = q.includes('kolkata') ? q : `${q}, Kolkata`;
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(fullQ)}&lat=${restaurantConfig.location.latitude}&lon=${restaurantConfig.location.longitude}&limit=1`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates; // [lon, lat]
          if (Array.isArray(coords) && coords.length >= 2) {
            return { latitude: coords[1], longitude: coords[0] };
          }
        }
      }
    } catch (e) {
      console.warn('Photon geocoding failed:', e);
    }
  }

  // 3. Try Nominatim API
  for (const q of queryVariants) {
    try {
      const fullQ = q.includes('kolkata') ? q : `${q}, Kolkata, West Bengal`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQ)}&limit=1&countrycodes=in`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            return { latitude: lat, longitude: lon };
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim geocoding failed:', e);
    }
  }

  // 4. Try Pincode matching (e.g. 700014, 700017, 700091)
  const pinMatch = clean.match(/\b700\d{3}\b/);
  if (pinMatch) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`Kolkata ${pinMatch[0]}`)}&limit=1&countrycodes=in`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            return { latitude: lat, longitude: lon };
          }
        }
      }
    } catch (e) {
      console.warn('Pincode geocoding failed:', e);
    }
  }

  return null;
}
