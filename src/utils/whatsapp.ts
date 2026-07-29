import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance } from './delivery';

export function formatWhatsAppMessage(order: OrderState): string {
  const { customerName, customerPhone, orderType, location, cart, specialInstructions } = order;

  // Calculate items list formatted
  const itemsText = cart
    .map((c) => `• ${c.item.name} × ${c.quantity} (₹${c.item.price * c.quantity})`)
    .join('\n');

  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);

  const isDelivery = orderType === 'delivery';
  const distanceKm = isDelivery ? getOrderDeliveryDistance(location?.latitude, location?.longitude) : null;
  const deliveryFee = isDelivery ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const grandTotal = subtotal + deliveryFee;

  let locationHeader = '📍 *Delivery Location*';
  let locationText = '';

  if (isDelivery) {
    locationHeader = '📍 *Delivery Location*';
    if (location?.type === 'geo' && location?.mapsUrl) {
      locationText = location.mapsUrl;
    } else if (location?.address) {
      locationText = location.address;
    } else {
      locationText = 'Address not provided';
    }
  } else {
    locationHeader = '🏪 *Pickup Store Location*';
    locationText = `${restaurantConfig.address}\nGoogle Maps: ${restaurantConfig.googleMapsUrl}`;
  }

  const orderTypeText = isDelivery ? '🚚 Delivery' : '🏪 Self Pickup';
  const instructionsText = specialInstructions && specialInstructions.trim() ? specialInstructions.trim() : 'None';
  const distanceText = distanceKm !== null ? `${distanceKm.toFixed(2)} km` : 'Manual Address';

  const billingSection = isDelivery
    ? `💰 *Subtotal:* ₹${subtotal}
📏 *Delivery Distance:* ${distanceText}
🚚 *Delivery Fee:* ₹${deliveryFee}${deliveryFee === 0 ? ' (FREE)' : ''}
💵 *Total Amount:* ₹${grandTotal}`
    : `💰 *Subtotal:* ₹${subtotal}
🛍️ *Pickup:* Free
💵 *Total Amount:* ₹${grandTotal}`;

  const message = `🍫 *NEW ORDER - ${restaurantConfig.name}*

━━━━━━━━━━━━━━━━━━

👤 *Customer*
${customerName}

📞 *Phone*
${customerPhone}

📦 *Order Type*
${orderTypeText}

${locationHeader}
${locationText}

━━━━━━━━━━━━━━━━━━

🧇 *ITEMS ORDERED*

${itemsText}

━━━━━━━━━━━━━━━━━━

${billingSection}

━━━━━━━━━━━━━━━━━━

📝 *Special Instructions*

${instructionsText}`;

  return message;
}

export function generateWhatsAppLink(order: OrderState): string {
  const text = formatWhatsAppMessage(order);
  const phone = `${restaurantConfig.whatsappCountryCode}${restaurantConfig.whatsappNumber}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
