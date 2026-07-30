import { restaurantConfig } from '../config/restaurantConfig';

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

// Bounding box for Kolkata Metropolitan Area to discard invalid API geocodes outside Kolkata
const KOLKATA_BOUNDS = {
  minLat: 22.20,
  maxLat: 22.85,
  minLon: 88.10,
  maxLon: 88.65,
};

function isInKolkataBounds(lat: number, lon: number): boolean {
  return lat >= KOLKATA_BOUNDS.minLat && lat <= KOLKATA_BOUNDS.maxLat &&
         lon >= KOLKATA_BOUNDS.minLon && lon <= KOLKATA_BOUNDS.maxLon;
}

// Comprehensive Kolkata neighborhoods, roads, metro stations & landmark coordinates
const KOLKATA_LOCALITIES: Array<{ keywords: string[]; coords: GeoCoords }> = [
  // Immediate Vicinity & Beniapukur / Entally
  { keywords: ['sundari mohan', 'dr sundari mohan', 'baba tea', 'linton post office'], coords: { latitude: 22.5463, longitude: 88.3688 } },
  { keywords: ['linton', 'linton st', 'linton street'], coords: { latitude: 22.5458, longitude: 88.3675 } },
  { keywords: ['tanti bagan', 'tantibagan', 'tanti bagan lane'], coords: { latitude: 22.5428, longitude: 88.3712 } },
  { keywords: ['beniapukur', 'beniapukur road'], coords: { latitude: 22.5440, longitude: 88.3690 } },
  { keywords: ['cit road', 'cit rd', 'ananda palit'], coords: { latitude: 22.5482, longitude: 88.3678 } },
  { keywords: ['entally', 'entally market'], coords: { latitude: 22.5510, longitude: 88.3680 } },

  // Park Circus & Central South
  { keywords: ['park circus', 'seven point', '7 point'], coords: { latitude: 22.5410, longitude: 88.3650 } },
  { keywords: ['mullick bazar', 'mallik bazar', 'beckbagan'], coords: { latitude: 22.5480, longitude: 88.3610 } },
  { keywords: ['park street', 'park st', 'flurys'], coords: { latitude: 22.5530, longitude: 88.3520 } },
  { keywords: ['camac street', 'camac st', 'theatre road', 'shakespeare sarani'], coords: { latitude: 22.5480, longitude: 88.3530 } },
  { keywords: ['ripon street', 'muzaffar ahmed', 'elliot road'], coords: { latitude: 22.5540, longitude: 88.3580 } },
  { keywords: ['loudon street', 'rawdon street'], coords: { latitude: 22.5490, longitude: 88.3560 } },

  // Sealdah & Central Kolkata
  { keywords: ['sealdah', 'sealdah station', 'baithakkhana'], coords: { latitude: 22.5670, longitude: 88.3710 } },
  { keywords: ['moulali', 'moulali crossing'], coords: { latitude: 22.5570, longitude: 88.3660 } },
  { keywords: ['esplanade', 'dharmatala', 'curzon park', 'lenin sarani'], coords: { latitude: 22.5650, longitude: 88.3520 } },
  { keywords: ['chandni chowk', 'chandni', 'e-mall'], coords: { latitude: 22.5680, longitude: 88.3560 } },
  { keywords: ['bowbazar', 'bb ganguly'], coords: { latitude: 22.5690, longitude: 88.3610 } },
  { keywords: ['college street', 'bata nagar', 'coffee house'], coords: { latitude: 22.5740, longitude: 88.3630 } },
  { keywords: ['amherst street', 'raja rammohan'], coords: { latitude: 22.5730, longitude: 88.3660 } },
  { keywords: ['bbd bagh', 'dalhousie', 'writers building'], coords: { latitude: 22.5710, longitude: 88.3490 } },

  // East Kolkata & EM Bypass
  { keywords: ['topsia', 'topsia road'], coords: { latitude: 22.5380, longitude: 88.3880 } },
  { keywords: ['tangra', 'chinatown', 'chinese kali bari'], coords: { latitude: 22.5510, longitude: 88.3870 } },
  { keywords: ['science city', 'parama flyover'], coords: { latitude: 22.5400, longitude: 88.3950 } },
  { keywords: ['ruby', 'ruby hospital', 'ruby crossing'], coords: { latitude: 22.5150, longitude: 88.3970 } },
  { keywords: ['kasba', 'kasba new market', 'bosepukur'], coords: { latitude: 22.5180, longitude: 88.3850 } },
  { keywords: ['mukundapur', 'rn tagore'], coords: { latitude: 22.4850, longitude: 88.3990 } },

  // South Kolkata
  { keywords: ['ballygunge', 'ballygunge phari', 'ballygunge circular'], coords: { latitude: 22.5280, longitude: 88.3650 } },
  { keywords: ['gariahat', 'gariahat crossing'], coords: { latitude: 22.5180, longitude: 88.3670 } },
  { keywords: ['golpark'], coords: { latitude: 22.5130, longitude: 88.3650 } },
  { keywords: ['dhakuria', 'dhakuria bridge'], coords: { latitude: 22.5070, longitude: 88.3680 } },
  { keywords: ['jadavpur', '8b bus stand', 'jadavpur university'], coords: { latitude: 22.4990, longitude: 88.3680 } },
  { keywords: ['hazra', 'hazra crossing', 'kalighat'], coords: { latitude: 22.5260, longitude: 88.3470 } },
  { keywords: ['bhowanipore', 'bhawanipur', 'exide'], coords: { latitude: 22.5350, longitude: 88.3480 } },
  { keywords: ['alipore', 'zoo', 'command hospital'], coords: { latitude: 22.5330, longitude: 88.3330 } },
  { keywords: ['tollygunge', 'karunamoyee tolly', 'royal kolkata golf'], coords: { latitude: 22.4930, longitude: 88.3480 } },
  { keywords: ['prince anwar shah', 'south city', 'south city mall'], coords: { latitude: 22.5020, longitude: 88.3610 } },
  { keywords: ['lake gardens'], coords: { latitude: 22.5080, longitude: 88.3580 } },
  { keywords: ['garia', 'garia main road', 'mahanti'], coords: { latitude: 22.4670, longitude: 88.3830 } },
  { keywords: ['naktala', 'bansdroni'], coords: { latitude: 22.4770, longitude: 88.3710 } },
  { keywords: ['behala', 'manton', 'chowrasta', 'sakher bazar'], coords: { latitude: 22.4970, longitude: 88.3180 } },

  // Salt Lake & New Town
  { keywords: ['sector v', 'sector 5', 'salt lake sector v', 'salt lake sec 5', 'webel'], coords: { latitude: 22.5726, longitude: 88.4320 } },
  { keywords: ['salt lake', 'bidhannagar', 'karunamoyee', 'city centre 1', 'cc1'], coords: { latitude: 22.5800, longitude: 88.4170 } },
  { keywords: ['new town', 'rajarhat', 'action area 1', 'action area 2', 'eco park', 'biswa bangla'], coords: { latitude: 22.5850, longitude: 88.4710 } },

  // North Kolkata & Suburbs
  { keywords: ['ultadanga', 'hudco', 'ultadanga main road'], coords: { latitude: 22.5870, longitude: 88.3850 } },
  { keywords: ['kankurgachi', 'kankurgachi crossing'], coords: { latitude: 22.5780, longitude: 88.3860 } },
  { keywords: ['shyambazar', 'five point', '5 point'], coords: { latitude: 22.6000, longitude: 88.3700 } },
  { keywords: ['girish park', 'hatibagan'], coords: { latitude: 22.5900, longitude: 88.3650 } },
  { keywords: ['burrabazar', 'sobaganj'], coords: { latitude: 22.5810, longitude: 88.3550 } },
  { keywords: ['dum dum', 'dumdum', 'dum dum station'], coords: { latitude: 22.6220, longitude: 88.3930 } },
  { keywords: ['baguiati', 'vip road', 'kaikhali', 'airport'], coords: { latitude: 22.6180, longitude: 88.4230 } },
  { keywords: ['howrah', 'howrah station', 'howrah bridge'], coords: { latitude: 22.5840, longitude: 88.3430 } },
];

// Kolkata pincode center coordinates fallback table
const PINCODE_MAP: Record<string, GeoCoords> = {
  '700014': { latitude: 22.5463, longitude: 88.3688 }, // Beniapukur / Sundari Mohan Ave
  '700017': { latitude: 22.5410, longitude: 88.3650 }, // Park Circus
  '700016': { latitude: 22.5530, longitude: 88.3520 }, // Park Street
  '700015': { latitude: 22.5510, longitude: 88.3680 }, // Entally / Tangra
  '700019': { latitude: 22.5280, longitude: 88.3650 }, // Ballygunge
  '700029': { latitude: 22.5180, longitude: 88.3670 }, // Gariahat
  '700032': { latitude: 22.4990, longitude: 88.3680 }, // Jadavpur
  '700078': { latitude: 22.5150, longitude: 88.3970 }, // Kasba / Ruby
  '700046': { latitude: 22.5380, longitude: 88.3880 }, // Topsia
  '700012': { latitude: 22.5680, longitude: 88.3560 }, // Chandni Chowk
  '700069': { latitude: 22.5650, longitude: 88.3520 }, // Dharmatala
  '700001': { latitude: 22.5710, longitude: 88.3490 }, // BBD Bagh
  '700009': { latitude: 22.5730, longitude: 88.3660 }, // Amherst Street
  '700006': { latitude: 22.5900, longitude: 88.3650 }, // Girish Park
  '700004': { latitude: 22.6000, longitude: 88.3700 }, // Shyambazar
  '700053': { latitude: 22.5330, longitude: 88.3330 }, // Alipore
  '700034': { latitude: 22.4970, longitude: 88.3180 }, // Behala
  '700047': { latitude: 22.4670, longitude: 88.3830 }, // Garia
  '700067': { latitude: 22.5870, longitude: 88.3850 }, // Ultadanga
  '700054': { latitude: 22.5780, longitude: 88.3860 }, // Kankurgachi
  '700091': { latitude: 22.5726, longitude: 88.4320 }, // Salt Lake Sec V
  '700064': { latitude: 22.5800, longitude: 88.4170 }, // Salt Lake Sec I/III
  '700156': { latitude: 22.5850, longitude: 88.4710 }, // New Town
  '700052': { latitude: 22.6180, longitude: 88.4230 }, // VIP Road
  '700028': { latitude: 22.6220, longitude: 88.3930 }, // Dum Dum
  '711101': { latitude: 22.5840, longitude: 88.3430 }, // Howrah
};

/**
 * Geocodes a user-entered Kolkata address string into lat/lon coordinates.
 */
export async function geocodeKolkataAddress(addressStr: string): Promise<GeoCoords> {
  const clean = addressStr.trim().toLowerCase();
  
  // Default fallback coords (Restaurant location area)
  const defaultRestaurantCoords: GeoCoords = {
    latitude: restaurantConfig.location.latitude,
    longitude: restaurantConfig.location.longitude,
  };

  if (!clean) return defaultRestaurantCoords;

  // 1. Direct Keyword Match against Kolkata Localities Table
  for (const loc of KOLKATA_LOCALITIES) {
    if (loc.keywords.some((kw) => clean.includes(kw))) {
      return loc.coords;
    }
  }

  // 2. Direct Pincode Lookup
  const pinMatch = clean.match(/\b700\d{3}\b/) || clean.match(/\b711\d{3}\b/);
  if (pinMatch && PINCODE_MAP[pinMatch[0]]) {
    return PINCODE_MAP[pinMatch[0]];
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

  // 3. Try Photon API (OpenStreetMap geocoder with lat/lon proximity bias for Kolkata)
  for (const q of queryVariants) {
    try {
      const fullQ = q.includes('kolkata') ? q : `${q}, Kolkata, West Bengal, India`;
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(fullQ)}&lat=${restaurantConfig.location.latitude}&lon=${restaurantConfig.location.longitude}&limit=1`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates; // [lon, lat]
          if (Array.isArray(coords) && coords.length >= 2) {
            const lat = coords[1];
            const lon = coords[0];
            if (isInKolkataBounds(lat, lon)) {
              return { latitude: lat, longitude: lon };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Photon geocoding failed:', e);
    }
  }

  // 4. Try Nominatim API
  for (const q of queryVariants) {
    try {
      const fullQ = q.includes('kolkata') ? q : `${q}, Kolkata, West Bengal`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQ)}&limit=1&countrycodes=in`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon) && isInKolkataBounds(lat, lon)) {
            return { latitude: lat, longitude: lon };
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim geocoding failed:', e);
    }
  }

  // Fallback to default restaurant area coordinates
  return defaultRestaurantCoords;
}

