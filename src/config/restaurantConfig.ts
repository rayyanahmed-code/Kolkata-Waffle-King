export const restaurantConfig = {
  name: 'Kolkata Waffle King',
  tagline: 'Freshly Baked Happiness in Every Bite',
  whatsappNumber: '7003459674', // Restaurant's receiving WhatsApp number
  whatsappCountryCode: '91',
  currencySymbol: '₹',
  address: '98 Dr Sundari Mohan Avenue near Baba Tea, opposite Linton Post Office, Kolkata, West Bengal 700014',
  googleMapsUrl: 'https://maps.app.goo.gl/Y75xAgNZLW75RRfs6',
  location: {
    latitude: 22.5463,
    longitude: 88.3688,
  },
  upi: {
    upiId: '7003459674@kotakbank',
    payeeName: 'MD SAMIR IQBAL',
    bankName: 'Kotak Bank',
  },
  openingHours: '11:00 AM - 11:30 PM (Daily)',
  estimatedTime: '20-30 mins',
  deliveryFee: 30, // Base/default estimated delivery charge in INR
  freeDeliveryThreshold: 300, // Free delivery above 300 INR for <= 2 km
  branding: {
    primaryColor: '#2C1810', // Dark Chocolate Brown
    accentColor: '#E5A93B',  // Golden Yellow
    secondaryColor: '#FAF6F0', // Soft Beige
    darkBg: '#180E0A',
  },
  socials: {
    instagram: '@kolkatawaffleking',
    facebook: 'KolkataWaffleKingOfficial',
  },
  assistant: {
    name: 'WaffleBot 🍫',
    greetingTitle: '🍫 Welcome to Kolkata Waffle King!',
    greetingSubtitle: 'Freshly Baked Happiness in Every Bite.',
    greetingMessage: "I'm your personal ordering assistant. I'll help you place your order in under 60 seconds.",
    startOrderBtnText: 'Start Order 🧇',
  }
};
