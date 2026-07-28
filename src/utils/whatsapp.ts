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

  const distanceKm = orderType === 'delivery' ? getOrderDeliveryDistance(location?.latitude, location?.longitude) : null;
  const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const grandTotal = subtotal + deliveryFee;

  let locationText = 'N/A (Pickup Order)';
  if (orderType === 'delivery' && location) {
    if (location.type === 'geo' && location.mapsUrl) {
      locationText = location.mapsUrl;
    } else if (location.address) {
      locationText = location.address;
    }
  }

  const orderTypeText = orderType === 'delivery' ? 'Delivery' : 'Pickup';
  const instructionsText = specialInstructions && specialInstructions.trim() ? specialInstructions.trim() : 'None';
  const distanceText = distanceKm !== null ? `${distanceKm.toFixed(2)} km` : 'Manual Address';

  const message = `🍫 *NEW ORDER - ${restaurantConfig.name}*

━━━━━━━━━━━━━━━━━━

👤 *Customer*
${customerName}

📞 *Phone*
${customerPhone}

🚚 *Order Type*
${orderTypeText}

📍 *Delivery Location*
${locationText}

━━━━━━━━━━━━━━━━━━

🧇 *ITEMS ORDERED*

${itemsText}

━━━━━━━━━━━━━━━━━━

💰 *Subtotal:* ₹${subtotal}
${orderType === 'delivery' ? `📏 *Delivery Distance:* ${distanceText}\n` : ''}🚚 *Delivery Fee:* ₹${deliveryFee}${deliveryFee === 0 && orderType === 'delivery' ? ' (FREE)' : ''}

💵 *Total Amount:* ₹${grandTotal}

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
