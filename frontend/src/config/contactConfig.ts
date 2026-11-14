/**
 * Centralized Contact and Brand Configuration for YatraBus
 * Used across Contact Us page, Hero, Info Cards, and Site Footer.
 */

export interface ContactConfig {
  brandName: string;
  supportEmail: string;
  helpdeskEmail: string;
  phone: {
    display: string;
    tollFreeLabel: string;
    tel: string;
    hours: string;
  };
  headquarters: {
    name: string;
    building: string;
    address: string;
    badge: string;
  };
  regionalOffices: {
    kolkata: string;
  };
}

export const CONTACT_CONFIG: ContactConfig = {
  brandName: 'YatraBus',
  supportEmail: 'support@yatrabus.in',
  helpdeskEmail: 'helpdesk@yatrabus.in',
  phone: {
    display: '+91 1800 250 8737',
    tollFreeLabel: '1800-250-8737 (24/7 Toll-Free)',
    tel: '+9118002508737',
    hours: '24 Hours / 7 Days'
  },
  headquarters: {
    name: 'National Dispatch HQ',
    building: 'Connaught Place Transit Tower',
    address: 'Regal Building, Connaught Place, New Delhi 110001, India',
    badge: 'Central Operations'
  },
  regionalOffices: {
    kolkata: 'Patuli, Kolkata - 700016, West Bengal, India'
  }
};
