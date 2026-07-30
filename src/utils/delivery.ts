import { restaurantConfig } from '../config/restaurantConfig';

export const BEVERAGE_CATEGORIES = ['mocktails', 'milkshakes', 'coffee', 'popping_boba'];

/**
 * Checks if a category corresponds to a beverage (which is exempt from parcel box charge).
 */
export function isBeverageCategory(category: string): boolean {
  return BEVERAGE_CATEGORIES.includes(category);
}

/**
 * Calculates parcel box charge for the order.
 * Charges ₹5 per item unit for all items EXCEPT beverages.
 */
export function calculateParcelCharge(
  cart: Array<{ item: { category: string }; quantity: number }>
): number {
  return cart.reduce((total, cartItem) => {
    if (!isBeverageCategory(cartItem.item.category)) {
      return total + 5 * cartItem.quantity;
    }
    return total;
  }, 0);
}

/**
 * Returns the total count of non-beverage items in cart.
 */
export function getNonBeverageItemCount(
  cart: Array<{ item: { category: string }; quantity: number }>
): number {
  return cart.reduce((total, cartItem) => {
    if (!isBeverageCategory(cartItem.item.category)) {
      return total + cartItem.quantity;
    }
    return total;
  }, 0);
}

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using Haversine formula.
 * Returns distance rounded to 2 decimal places.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}

/**
 * Calculates real driving road distance using OSRM, falling back to scaled Haversine for city driving.
 */
export async function fetchRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
        const meters = data.routes[0].distance;
        if (typeof meters === 'number' && meters > 0) {
          return Math.round((meters / 1000) * 100) / 100;
        }
      }
    }
  } catch (err) {
    console.warn('OSRM road routing failed/timed out, using scaled city distance:', err);
  }

  // Fallback: Haversine straight-line distance scaled by 1.35 for Kolkata city driving routes
  const straightLine = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(straightLine * 1.35 * 100) / 100;
}

/**
 * Delivery fee rules for Kolkata Waffle King:
 * 1. If distance <= 2.00 km:
 *    - Subtotal >= ₹300: ₹0 (Free Delivery)
 *    - Subtotal < ₹300: ₹30
 * 2. If distance > 2.00 km:
 *    - Base delivery charge = ₹40
 *    - Add ₹10 for every FULL additional 1 km beyond the first 2 km.
 *    - Do NOT round up or down partial kilometers.
 */
export function calculateDeliveryFee(
  distanceKm: number | null,
  subtotal: number
): number {
  if (distanceKm === null || distanceKm === undefined) {
    // Fallback if distance cannot be calculated (e.g. manual address without coordinates)
    return subtotal >= 300 ? 0 : 30;
  }

  const dist = Math.round(distanceKm * 100) / 100;

  if (dist <= 2.00) {
    return subtotal >= 300 ? 0 : 30;
  } else {
    const distanceBeyondTwoKm = Math.round((dist - 2.0) * 100) / 100;
    const additionalFullKm = Math.floor(distanceBeyondTwoKm);
    return 40 + additionalFullKm * 10;
  }
}

/**
 * Helper to get distance for an order if customer location object or coordinates are available.
 * Supports passing either a location object (with optional distanceKm) or direct lat/lon numbers.
 */
export function getOrderDeliveryDistance(
  locationOrLat?: { latitude?: number; longitude?: number; distanceKm?: number } | number | null,
  longitude?: number
): number | null {
  if (locationOrLat === undefined || locationOrLat === null) return null;

  if (typeof locationOrLat === 'number') {
    if (longitude === undefined || longitude === null) return null;
    return calculateDistanceKm(
      restaurantConfig.location.latitude,
      restaurantConfig.location.longitude,
      locationOrLat,
      longitude
    );
  }

  if (typeof locationOrLat.distanceKm === 'number') {
    return locationOrLat.distanceKm;
  }

  if (
    locationOrLat.latitude !== undefined &&
    locationOrLat.latitude !== null &&
    locationOrLat.longitude !== undefined &&
    locationOrLat.longitude !== null
  ) {
    return calculateDistanceKm(
      restaurantConfig.location.latitude,
      restaurantConfig.location.longitude,
      locationOrLat.latitude,
      locationOrLat.longitude
    );
  }

  return null;
}
