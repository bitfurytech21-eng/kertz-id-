import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface KretzProperty {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  property_type: 'House' | 'Apartment' | 'Private Mansion' | 'Villa' | 'Château' | 'Chalet' | 'Penthouse' | 'Land' | 'Commercial property';
  address: string;
  city: string;
  state_region: string;
  country: string;
  cadastral_id: string;
  land_registry_ref: string;
  asking_price: number;
  currency: string;
  living_area_sqm: number;
  land_area_sqm?: number;
  bedrooms: number;
  bathrooms: number;
  reception_rooms: number;
  floor_level?: string;
  year_built?: number;
  architectural_style: string;
  notary_jurisdiction: string;
  legal_status: 'AVAILABLE' | 'UNDER_OFFER' | 'TRANSACTION_IN_PROGRESS' | 'ACQUIRED';
  features: string[];
  key_amenities: string[];
  legal_title_type: 'Freehold' | 'Co-ownership (Copropriété)' | 'SCI Share Acquisition' | 'Estate Freehold';
  due_diligence_pack_ready: boolean;
  cadastral_status?: string;
  tax_compliance_status?: string;
  energy_rating?: string;
  images: {
    hero: string;
    gallery: string[];
  };
  tags: string[];
  // Rich attributes from https://kretz.site/#/annonce/
  ref?: string;
  annonce_url?: string;
  tour_url?: string;
  video_url?: string;
  coordinates?: { lat: number; lng: number };
  agent?: {
    name: string;
    phone: string;
    email: string;
    photo: string;
    role: string;
  };
  is_confidential?: boolean;
  is_exclusive?: boolean;
  is_off_market?: boolean;
  created_at: string;
  updated_at: string;
}

// Load all 207 real properties fetched from https://kretz.site/#/annonce/
let scrapedProperties: KretzProperty[] = [];
try {
  const jsonPath = path.resolve(__dirname, 'kretzScrapedProperties.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    scrapedProperties = JSON.parse(rawData);
  }
} catch (e) {
  console.error('[Kretz Properties] Error loading kretzScrapedProperties.json:', e);
}

export const KRETZ_PROPERTIES_DATABASE: KretzProperty[] = scrapedProperties;
