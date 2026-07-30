import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance, calculateParcelCharge } from './delivery';

export function formatWhatsAppMessage(order: OrderState): string {
  const { customerName, customerPhone, orderType, location, cart, specialInstructions } = order;

  // Calculate items list formatted
  const itemsText = cart
    .map((c) => `• ${c.item.name} × ${c.quantity} (₹${c.item.price * c.quantity})`)
    .join('\n');

  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const parcelFee = calculateParcelCharge(cart);

  const isDelivery = orderType === 'delivery';
  const distanceKm = isDelivery ? getOrderDeliveryDistance(location) : null;
  const deliveryFee = isDelivery ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const grandTotal = subtotal + parcelFee + deliveryFee;

  const advancePaid = Math.ceil(grandTotal * 0.5);
  const remainingAmount = grandTotal - advancePaid;

  let locationHeader = '📍 *Delivery Location*';
  let locationText = '';

  if (isDelivery) {
    locationHeader = '📍 *Delivery Location*';
    if (location?.type === 'geo' && location?.mapsUrl) {
      locationText = location.mapsUrl;
    } else if (location?.address) {
      const cleanAddr = location.address.trim();
      const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}`;
      locationText = `Manual Address:\n${cleanAddr}\n\nGoogle Maps:\n${gmapsSearchUrl}`;
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
📦 *Parcel Box:* ₹${parcelFee}
📏 *Delivery Distance:* ${distanceText}
🚚 *Delivery Fee:* ₹${deliveryFee}${deliveryFee === 0 ? ' (FREE)' : ''}
💵 *Total Amount:* ₹${grandTotal}`
    : `💰 *Subtotal:* ₹${subtotal}
📦 *Parcel Box:* ₹${parcelFee}
🛍️ *Pickup:* Free
💵 *Total Amount:* ₹${grandTotal}`;

  const paymentDetailsSection = `💳 *Payment Details*

Payment Method:
UPI QR Payment

Advance Paid:
₹${advancePaid}

Remaining Amount:
₹${remainingAmount}`;

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

${paymentDetailsSection}

━━━━━━━━━━━━━━━━━━

📝 *Special Instructions*

${instructionsText}

━━━━━━━━━━━━━━━━━━

📸 *IMPORTANT*

Please attach your payment screenshot after this message before pressing Send.

Orders without payment proof may not be confirmed.`;

  return message;
}

export function generateWhatsAppLink(order: OrderState): string {
  const text = formatWhatsAppMessage(order);
  const phone = `${restaurantConfig.whatsappCountryCode}${restaurantConfig.whatsappNumber}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
