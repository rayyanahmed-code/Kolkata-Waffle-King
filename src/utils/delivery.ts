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
 * Helper to get distance for an order if customer location coordinates are available.
 */
export function getOrderDeliveryDistance(
  latitude?: number,
  longitude?: number
): number | null {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return null;
  }
  return calculateDistanceKm(
    restaurantConfig.location.latitude,
    restaurantConfig.location.longitude,
    latitude,
    longitude
  );
}
