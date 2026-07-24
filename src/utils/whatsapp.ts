import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';

export function formatWhatsAppMessage(order: OrderState): string {
  const { customerName, customerPhone, orderType, location, cart, specialInstructions } = order;

  // Calculate items list formatted
  const itemsText = cart
    .map((c) => `• ${c.item.name} x${c.quantity} (₹${c.item.price * c.quantity})`)
    .join('\n');

  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? restaurantConfig.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  let locationText = 'N/A (Pickup Order)';
  if (orderType === 'delivery' && location) {
    if (location.type === 'geo' && location.mapsUrl) {
      locationText = `📍 Live Location: ${location.mapsUrl}`;
      if (location.address) {
        locationText += `\n(Approx. Address: ${location.address})`;
      }
    } else if (location.address) {
      locationText = `🏠 Manual Address: ${location.address}`;
    }
  }

  const instructionsText = specialInstructions.trim() ? specialInstructions.trim() : 'None';

  const message = `🍫 *New Order - ${restaurantConfig.name}*

*Customer Name:* ${customerName}
*Phone:* ${customerPhone}
*Order Type:* ${orderType === 'delivery' ? '🚚 Delivery' : '🏃 Pickup'}
*Location:*
${locationText}

-----------------

*Items Ordered:*
${itemsText}

*Subtotal:* ₹${subtotal}
${orderType === 'delivery' ? `*Delivery Fee:* ₹${deliveryFee}\n` : ''}*Total Amount:* ₹${grandTotal}

-----------------

*Special Instructions:*
${instructionsText}

Please contact customer to confirm order.`;

  return message;
}

export function generateWhatsAppLink(order: OrderState): string {
  const text = formatWhatsAppMessage(order);
  const phone = `${restaurantConfig.whatsappCountryCode}${restaurantConfig.whatsappNumber}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
