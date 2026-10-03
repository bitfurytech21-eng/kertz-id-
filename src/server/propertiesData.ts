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
  cadastral_status: string;
  tax_compliance_status: string;
  energy_rating: string;
  images: {
    hero: string;
    gallery: string[];
  };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const KRETZ_PROPERTIES_DATABASE: KretzProperty[] = [
  {
    id: 'KP-PARIS-001',
    name: 'Hôtel Particulier Champ-de-Mars',
    slug: 'hotel-particulier-champ-de-mars-paris-7',
    headline: 'Exceptional 19th-Century Private Mansion with Direct Eiffel Tower & Private Garden Views',
    description: 'Located in the prestigious 7th arrondissement of Paris, steps from the Champ-de-Mars, this private hôtel particulier offers 650 m² of meticulously restored living space spanning four elevator-accessible levels, surrounded by a 280 m² private landscaped English garden. Features 4-meter high ceilings, authentic gilding, private sommelier wine vault, and integrated smart security infrastructure.',
    property_type: 'Private Mansion',
    address: '14 Avenue de la Bourdonnais, 75007 Paris',
    city: 'Paris',
    state_region: 'Île-de-France',
    country: 'France',
    cadastral_id: '75107-000-AD-0089',
    land_registry_ref: 'PARIS-VOL-2024-P-8821',
    asking_price: 28500000,
    currency: 'EUR',
    living_area_sqm: 650,
    land_area_sqm: 480,
    bedrooms: 7,
    bathrooms: 8,
    reception_rooms: 4,
    floor_level: '4-Storey Private Mansion',
    year_built: 1894,
    architectural_style: 'Haussmannian / Belle Époque Private Mansion',
    notary_jurisdiction: 'Chambre des Notaires de Paris (7ème)',
    legal_status: 'AVAILABLE',
    features: [
      'Direct unobstructed Eiffel Tower view',
      '280 m² private walled garden with century-old magnolias',
      'Private glass elevator servicing all 4 levels',
      'Master suite with double walk-in dressing and hammam bathroom',
      'Temperature-controlled 1,200-bottle wine tasting cellar',
      'Staff accommodation with independent service entrance',
      'Underground private garage for 3 luxury vehicles',
      'Military-grade security, biometric access, and panic vault room'
    ],
    key_amenities: ['Private Garden', 'Elevator', 'Wine Cellar', 'Spa / Hammam', 'Garage', 'Smart Security', 'Staff Quarters', 'Terrace'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Verified & Registered with Cadastre de Paris',
    tax_compliance_status: 'Cleared (No Liens / No Encumbrances)',
    energy_rating: 'C (112 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Paris', 'Eiffel Tower', 'Private Mansion', 'Garden', 'Luxury', 'Haussmannian', 'Freehold'],
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-01T12:00:00Z'
  },
  {
    id: 'KP-ANTIBES-002',
    name: 'Waterfront Masterpiece Cap d\'Antibes',
    slug: 'waterfront-masterpiece-cap-d-antibes',
    headline: 'Ultra-Luxury Waterfront Estate with Private Helipad, Direct Deep-Water Dock & Sea Infinity Pool',
    description: 'A legendary trophy asset on the west coast of Cap d\'Antibes. Positioned directly on the Mediterranean shoreline with 850 m² of contemporary master architecture designed by Wilmotte & Associés, surrounded by 4,800 m² of flat landscaped Mediterranean botanical park with hundred-year-old umbrella pines.',
    property_type: 'Villa',
    address: 'Boulevard de Bacon, 06160 Cap d\'Antibes',
    city: 'Cap d\'Antibes',
    state_region: 'Provence-Alpes-Côte d\'Azur',
    country: 'France',
    cadastral_id: '06004-000-BK-0112',
    land_registry_ref: 'GRASSE-VOL-2023-P-1490',
    asking_price: 45000000,
    currency: 'EUR',
    living_area_sqm: 850,
    land_area_sqm: 4800,
    bedrooms: 9,
    bathrooms: 10,
    reception_rooms: 5,
    floor_level: '3 Levels Seafront',
    year_built: 2021,
    architectural_style: 'Contemporary Mediterranean Coastal Villa',
    notary_jurisdiction: 'Office Notarial d\'Antibes Juan-les-Pins',
    legal_status: 'AVAILABLE',
    features: [
      'Direct private deep-water marine mooring and private dock',
      '25-meter heated sea-facing ozone infinity swimming pool',
      'Private certified rooftop helicopter landing pad (H1 compliant)',
      'Wellness sanctuary with heated indoor hydrotherapy pool, sauna & cryo chamber',
      'Separate 2-bedroom guest pavilion & autonomous 3-bedroom staff cottage',
      'Underground showcase garage accommodating up to 6 luxury vehicles',
      'Perimeter laser security with 24/7 biometric maritime surveillance'
    ],
    key_amenities: ['Waterfront', 'Private Dock', 'Helipad', 'Infinity Pool', 'Indoor Pool', 'Spa', 'Guest House', 'Security System'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Direct Seafront Boundary Certified by Maritime Prefect',
    tax_compliance_status: 'Full Fiscal & Environmental Clearance',
    energy_rating: 'A (45 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['French Riviera', 'Cap d\'Antibes', 'Waterfront', 'Helipad', 'Dock', 'Infinity Pool', 'Trophy Asset'],
    created_at: '2026-01-15T11:00:00Z',
    updated_at: '2026-10-02T15:30:00Z'
  },
  {
    id: 'KP-STTROPEZ-003',
    name: 'Villa Bella Vista, Les Parcs de Saint-Tropez',
    slug: 'villa-bella-vista-les-parcs-saint-tropez',
    headline: 'Gated Private Domain Masterpiece with Sea Views, Olive Grove & Private Tennis Court',
    description: 'Situated within the ultra-exclusive private domain of "Les Parcs de Saint-Tropez" with 24/7 armed security. This 780 m² neo-Provençal contemporary villa enjoys elevated panoramic views of the Bay of Canoubiers, set within 5,200 m² of mature Mediterranean olive and cypress gardens.',
    property_type: 'Villa',
    address: 'Avenue des Parcs, 83990 Saint-Tropez',
    city: 'Saint-Tropez',
    state_region: 'Provence-Alpes-Côte d\'Azur',
    country: 'France',
    cadastral_id: '83119-000-CP-0044',
    land_registry_ref: 'DRAGUIGNAN-VOL-2024-P-3310',
    asking_price: 38000000,
    currency: 'EUR',
    living_area_sqm: 780,
    land_area_sqm: 5200,
    bedrooms: 8,
    bathrooms: 9,
    reception_rooms: 4,
    floor_level: '2 Levels with Lower Wellness Floor',
    year_built: 2020,
    architectural_style: 'Neo-Provençal Contemporary Luxury',
    notary_jurisdiction: 'Office Notarial de Saint-Tropez',
    legal_status: 'AVAILABLE',
    features: [
      'Located within the world\'s most guarded private domain (Les Parcs)',
      'Panoramic sunset views over the Gulf of Saint-Tropez & Canoubiers',
      '20m mirror swimming pool with submerged bar and teak sundecks',
      'Private championship synthetic clay tennis court and padel court',
      'State-of-the-art cinema room with Dolby Atmos sound system',
      'Professional chef kitchen with Sub-Zero & La Cornue installations'
    ],
    key_amenities: ['Private Domain', 'Sea View', 'Tennis Court', 'Padel Court', 'Cinema Room', 'Pool', 'Wine Cellar'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Domain Boundary & Co-Property Regulations Cleared',
    tax_compliance_status: 'Verified Clear Title with Notaire de Saint-Tropez',
    energy_rating: 'B (78 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Saint-Tropez', 'Les Parcs', 'Sea View', 'Tennis', 'Private Domain', 'Villa', 'High Security'],
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-09-28T14:00:00Z'
  },
  {
    id: 'KP-CAPFERRAT-004',
    name: 'Cliffside Estate, Saint-Jean-Cap-Ferrat',
    slug: 'cliffside-estate-saint-jean-cap-ferrat',
    headline: 'Iconic Belle Époque Cliffside Residence Overlooking the Mediterranean with Private Sea Access',
    description: 'One of Saint-Jean-Cap-Ferrat\'s most aristocratic estates, featuring 620 m² of pure architectural elegance overlooking the azure waters towards Monaco. Includes direct cliff path to a private cove, cascading Italian gardens, and expansive marble terraces.',
    property_type: 'Villa',
    address: 'Avenue Jean Mermoz, 06230 Saint-Jean-Cap-Ferrat',
    city: 'Saint-Jean-Cap-Ferrat',
    state_region: 'Provence-Alpes-Côte d\'Azur',
    country: 'France',
    cadastral_id: '06121-000-AE-0023',
    land_registry_ref: 'NICE-VOL-2024-P-5512',
    asking_price: 34000000,
    currency: 'EUR',
    living_area_sqm: 620,
    land_area_sqm: 3200,
    bedrooms: 6,
    bathrooms: 7,
    reception_rooms: 3,
    floor_level: '3 Levels Cliffside with Funicular',
    year_built: 1912,
    architectural_style: 'Riviera Belle Époque Palace',
    notary_jurisdiction: 'Chambre des Notaires des Alpes-Maritimes (Nice)',
    legal_status: 'AVAILABLE',
    features: [
      'Private private cliffside funicular elevator down to sea level',
      'Heated saltwater infinity pool perched over the Mediterranean cliffs',
      'Primary master wing with dual private sea-view balconies',
      'Restored Carrara marble fireplaces and 19th-century fresco ceilings',
      'Wine tasting room carved directly into the natural limestone bedrock'
    ],
    key_amenities: ['Cliffside Sea View', 'Private Cove Access', 'Funicular', 'Saltwater Pool', 'Historic Heritage'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Coastal Zone Maritime & Environmental Clearances Active',
    tax_compliance_status: 'Cleared & Registered with Land Registry of Nice',
    energy_rating: 'C (135 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Cap Ferrat', 'Belle Époque', 'Sea View', 'Funicular', 'Historic', 'Private Cove'],
    created_at: '2026-02-14T10:00:00Z',
    updated_at: '2026-09-30T16:00:00Z'
  },
  {
    id: 'KP-MEGEVE-005',
    name: 'Chalet Mont d\'Arbois Ski-In/Ski-Out',
    slug: 'chalet-mont-d-arbois-ski-in-ski-out-megeve',
    headline: 'Ultra-Luxury Alpine Chalet with Panoramic Mont Blanc Views, Indoor Pool & Private Ski Lounge',
    description: 'Nestled directly on the pristine slopes of Mont d\'Arbois in Megève, this 720 m² master-built alpine chalet represents the pinnacle of Savoyard craftsmanship combined with modern ultra-luxury amenities. Built with reclaimed centuries-old fir timber and Mont Blanc granite.',
    property_type: 'Chalet',
    address: 'Route du Mont d\'Arbois, 74120 Megève',
    city: 'Megève',
    state_region: 'Auvergne-Rhône-Alpes',
    country: 'France',
    cadastral_id: '74173-000-AR-0056',
    land_registry_ref: 'BONNEVILLE-VOL-2023-P-7740',
    asking_price: 22000000,
    currency: 'EUR',
    living_area_sqm: 720,
    land_area_sqm: 2400,
    bedrooms: 7,
    bathrooms: 8,
    reception_rooms: 3,
    floor_level: '4 Levels with Private Lift',
    year_built: 2022,
    architectural_style: 'Alpine Haute-Horlogerie Chalet',
    notary_jurisdiction: 'Office Notarial de Megève / Sallanches',
    legal_status: 'AVAILABLE',
    features: [
      'Direct Ski-in / Ski-out access to Mont d\'Arbois & Princess pistes',
      'Full wellness floor with 14m indoor swimming pool, sauna, hammam & jacuzzi',
      'Private 12-seat Dolby Atmos cinema with bespoke acoustic panelling',
      'State-of-the-art ski room with boot warmers, dry bar, and direct slope egress',
      'Dual master suites with vaulted timber ceilings and central open stone fireplaces'
    ],
    key_amenities: ['Ski-In/Ski-Out', 'Indoor Pool', 'Spa / Hammam', 'Cinema Room', 'Mont Blanc View', 'Fireplaces', 'Ski Room'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'High Alpine Zone Verified & Building Compliance Executed',
    tax_compliance_status: 'Full Urbanism Certificate & Non-Opposition Attested',
    energy_rating: 'A (52 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Megève', 'Ski Chalet', 'Mont Blanc', 'Indoor Pool', 'Ski-In Ski-Out', 'Alps', 'Spa'],
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-10-01T11:00:00Z'
  },
  {
    id: 'KP-MANHATTAN-006',
    name: 'Triplex Penthouse Tribeca with Private Rooftop Pool',
    slug: 'triplex-penthouse-tribeca-manhattan-ny',
    headline: 'Iconic 7,300 Sq Ft Crown Jewel Penthouse in Historic Cast-Iron Tribeca with Wrap-Around Terrace',
    description: 'Spanning the top three floors of a landmark cast-iron building in Tribeca, New York, this 680 m² (7,300 sq ft) triplex penthouse features 400 m² of landscaped private rooftop terraces, private heated plunge pool, 360-degree views of the Manhattan skyline and Hudson River, and keyed private elevator access.',
    property_type: 'Penthouse',
    address: 'Franklin Street, Tribeca, New York, NY 10013',
    city: 'New York',
    state_region: 'New York',
    country: 'United States',
    cadastral_id: 'NY-BLOCK-00178-LOT-0012',
    land_registry_ref: 'NYC-ACRIS-CRFN-2024000189',
    asking_price: 32000000,
    currency: 'USD',
    living_area_sqm: 680,
    land_area_sqm: 400,
    bedrooms: 5,
    bathrooms: 6,
    reception_rooms: 3,
    floor_level: 'Floors 6, 7 & Private Rooftop',
    year_built: 2019,
    architectural_style: 'Tribeca Cast-Iron Architectural Masterpiece',
    notary_jurisdiction: 'New York County Title Registry / Sullivan & Cromwell Escrow',
    legal_status: 'AVAILABLE',
    features: [
      '400 m² wrap-around terrace with outdoor kitchen, fireplace & heated plunge pool',
      'Private keyed direct elevator opening into double-height glass atrium',
      'Primary master wing occupying entire 7th floor with dual marble spa bathrooms',
      'Temperature-regulated glass-enclosed walk-in wine vault holding 1,500 bottles',
      'Custom Boffi kitchen with dual marble islands and Gaggenau 400 series suite'
    ],
    key_amenities: ['Rooftop Pool', 'Wrap-around Terrace', 'Skyline View', 'Keyed Elevator', 'Wine Vault', 'Smart Home', 'Doorman'],
    legal_title_type: 'Co-ownership (Copropriété)',
    due_diligence_pack_ready: true,
    cadastral_status: 'NYC Department of Buildings & ACRIS Title Guaranteed',
    tax_compliance_status: 'Clean Title Policy by First American Title Insurance',
    energy_rating: 'LEED Gold Certified',
    images: {
      hero: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['New York', 'Tribeca', 'Penthouse', 'Rooftop Pool', 'Skyline View', 'Terrace', 'Manhattan'],
    created_at: '2026-03-10T14:00:00Z',
    updated_at: '2026-09-25T17:00:00Z'
  },
  {
    id: 'KP-BORDEAUX-007',
    name: 'Château Grand Cru & Vignoble Historique, Saint-Émilion',
    slug: 'chateau-grand-cru-vignoble-saint-emilion-bordeaux',
    headline: '18th-Century Classified Grand Cru Wine Estate with 45 Hectares of Vineyards & State-of-the-Art Cellars',
    description: 'An extraordinary opportunity to acquire an internationally acclaimed Grand Cru Classé wine estate in Saint-Émilion, Bordeaux. The estate features a magnificent 1,400 m² 18th-century château with 18 suites, 45 hectares of prime terroir, fully equipped gravity-fed vinification chai, and historic limestone aging caves.',
    property_type: 'Château',
    address: 'Route des Grands Crus, 33330 Saint-Émilion',
    city: 'Saint-Émilion',
    state_region: 'Nouvelle-Aquitaine',
    country: 'France',
    cadastral_id: '33494-000-CH-0001',
    land_registry_ref: 'LIBOURNE-VOL-2024-P-1102',
    asking_price: 48000000,
    currency: 'EUR',
    living_area_sqm: 1400,
    land_area_sqm: 450000,
    bedrooms: 18,
    bathrooms: 20,
    reception_rooms: 6,
    floor_level: 'Château Main Building & 3 Farm Wings',
    year_built: 1765,
    architectural_style: 'French Neo-Classical Wine Château',
    notary_jurisdiction: 'Office Notarial de Bordeaux / Libourne',
    legal_status: 'AVAILABLE',
    features: [
      '45 hectares of AOP Saint-Émilion Grand Cru classified vineyard producing 180,000 bottles/yr',
      'Historic 18th-century residence with monumental stone staircase & reception halls',
      'Modern thermo-regulated stainless steel & French oak barrel aging chais (800 barrels)',
      'Centuries-old underground limestone quarries offering ideal natural temperature aging',
      'Guest reception pavilion and operational vineyard management team in place'
    ],
    key_amenities: ['Vineyard', 'Winery', 'Wine Cellars', 'Park & Forest', 'Guest Lodges', 'Helipad Access', 'Historic Monument'],
    legal_title_type: 'SCI Share Acquisition',
    due_diligence_pack_ready: true,
    cadastral_status: 'SAFER Agronomic & INAO Appellation Dossier Approved',
    tax_compliance_status: 'Full SAFER & Environmental Audit Completed',
    energy_rating: 'D (185 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Bordeaux', 'Saint-Émilion', 'Château', 'Vineyard', 'Grand Cru', 'Historic Estate', 'Winery'],
    created_at: '2026-03-15T09:30:00Z',
    updated_at: '2026-10-02T10:00:00Z'
  },
  {
    id: 'KP-CANNES-008',
    name: 'Penthouse Vue Mer, Boulevard de la Croisette Cannes',
    slug: 'penthouse-vue-mer-boulevard-croisette-cannes',
    headline: 'Frontline Duplex Penthouse Directly on La Croisette with 150 m² Panoramic Rooftop & Private Pool',
    description: 'Located in the most sought-after frontline palace building on the Boulevard de la Croisette, facing the Mediterranean and the Lérins Islands. Offers 420 m² of refined contemporary luxury, featuring a 150 m² private landscaped rooftop solarium with private swimming pool.',
    property_type: 'Penthouse',
    address: '52 Boulevard de la Croisette, 06400 Cannes',
    city: 'Cannes',
    state_region: 'Provence-Alpes-Côte d\'Azur',
    country: 'France',
    cadastral_id: '06029-000-CR-0052',
    land_registry_ref: 'GRASSE-VOL-2024-P-9923',
    asking_price: 18500000,
    currency: 'EUR',
    living_area_sqm: 420,
    land_area_sqm: 150,
    bedrooms: 5,
    bathrooms: 6,
    reception_rooms: 2,
    floor_level: 'Top 7th & 8th Floors (Duplex)',
    year_built: 2018,
    architectural_style: 'Contemporary French Riviera Palace',
    notary_jurisdiction: 'Chambre des Notaires de Cannes',
    legal_status: 'AVAILABLE',
    features: [
      'Frontline panoramic view over Cannes Bay, Port Canto & Palais des Festivals',
      '150 m² private teak rooftop with integrated glass-fronted swimming pool',
      'Private elevator opening directly into the grand marble reception salon',
      '24/7 concierge security, private underground double box garage'
    ],
    key_amenities: ['La Croisette', 'Sea View', 'Rooftop Pool', 'Direct Elevator', 'Concierge 24/7', 'Terrace', 'Garage'],
    legal_title_type: 'Co-ownership (Copropriété)',
    due_diligence_pack_ready: true,
    cadastral_status: 'Copropriété Rules & Loi Carrez Surface Audited (420.2 m²)',
    tax_compliance_status: 'All Copropriété & Urban Charges Cleared',
    energy_rating: 'B (68 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Cannes', 'La Croisette', 'Penthouse', 'Sea View', 'Rooftop Pool', 'Luxury'],
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-09-29T11:00:00Z'
  },
  {
    id: 'KP-MARRAKECH-009',
    name: 'Palais Mauresque & Oliveraie, Marrakech Palmeraie',
    slug: 'palais-mauresque-oliveraie-marrakech-palmeraie',
    headline: '1,200 m² Masterpiece Palace Surrounded by 2.5 Hectares of Century-Old Olive Groves & Atlas Views',
    description: 'Set within the prestigious Palmeraie of Marrakech, this 1,200 m² royal estate harmoniously combines traditional Moroccan zellige and cedarwood architecture with contemporary European comfort. Features a 30-meter heated swimming pool, private hammam spa, and direct Atlas Mountain views.',
    property_type: 'Private Mansion',
    address: 'Circuit de la Palmeraie, Marrakech 40000',
    city: 'Marrakech',
    state_region: 'Marrakech-Safi',
    country: 'Morocco',
    cadastral_id: 'MA-PALM-2024-8841',
    land_registry_ref: 'CONSERVATION-FONCIERE-KECH-449',
    asking_price: 12500000,
    currency: 'EUR',
    living_area_sqm: 1200,
    land_area_sqm: 25000,
    bedrooms: 10,
    bathrooms: 12,
    reception_rooms: 4,
    floor_level: '2 Levels around Courtyard Riad',
    year_built: 2021,
    architectural_style: 'Hispano-Moorish Palace',
    notary_jurisdiction: 'Conservation Foncière et Notariat de Marrakech',
    legal_status: 'AVAILABLE',
    features: [
      '2.5 hectares of private landscaped grounds with 400 olive and palm trees',
      '30-meter heated pool with Moroccan poolhouse and outdoor lounges',
      'Traditional marble hammam, sauna, and massage therapy rooms',
      'AVNA (Attestation de Vocation Non Agricole) cleared for international ownership'
    ],
    key_amenities: ['Palace', 'Olive Grove', 'Atlas View', 'Hammam Spa', 'Large Pool', 'Tennis', 'AVNA Clear'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Titre Foncier Purged & AVNA Foreign Ownership Certified',
    tax_compliance_status: 'Registered Clean with Conservation Foncière',
    energy_rating: 'A (38 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Marrakech', 'Palmeraie', 'Palace', 'Atlas View', 'Hammam', 'Trophy Asset'],
    created_at: '2026-04-12T15:00:00Z',
    updated_at: '2026-09-20T14:00:00Z'
  },
  {
    id: 'KP-COURCHEVEL-010',
    name: 'Chalet Ultra-Luxe Bellecôte, Courchevel 1850',
    slug: 'chalet-ultra-luxe-bellecote-courchevel-1850',
    headline: '890 m² Slopeside Palace in Courchevel 1850 with Indoor Lagoon, Private Club & Staff Suites',
    description: 'An architectural tour de force located in the ultra-exclusive Bellecôte enclave of Courchevel 1850. Features 890 m² of alpine grandeur with direct access to the Bellecôte slope, private indoor pool lagoon with waterfall, hammam, massage salon, nightclub/lounge, and 8 luxurious master suites.',
    property_type: 'Chalet',
    address: 'Rue de Bellecôte, 73120 Courchevel 1850',
    city: 'Courchevel',
    state_region: 'Auvergne-Rhône-Alpes',
    country: 'France',
    cadastral_id: '73227-000-BL-0019',
    land_registry_ref: 'ALBERTVILLE-VOL-2024-P-8822',
    asking_price: 42000000,
    currency: 'EUR',
    living_area_sqm: 890,
    land_area_sqm: 1850,
    bedrooms: 8,
    bathrooms: 10,
    reception_rooms: 4,
    floor_level: '5 Levels with Glass Panoramic Lift',
    year_built: 2023,
    architectural_style: 'Haute-Savoie Ultra-Luxury Ski Palace',
    notary_jurisdiction: 'Office Notarial de Moûtiers / Courchevel',
    legal_status: 'AVAILABLE',
    features: [
      'Direct ski-in / ski-out on the iconic Bellecôte slope of Courchevel 1850',
      'Indoor swimming lagoon with waterfall, hammam, sauna, and cryotherapy chamber',
      'Private nightclub with soundproof acoustic engineering, bar and DJ booth',
      'Private wine tasting vault with master sommelier selection'
    ],
    key_amenities: ['Ski-In/Ski-Out', 'Indoor Lagoon Pool', 'Spa & Wellness', 'Nightclub', 'Elevator', 'Courchevel 1850', 'Wine Cellar'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Verified Cadastral Boundary & Ski Slope Access Rights',
    tax_compliance_status: 'Full Fiscal & Urbanism Clearance Attested',
    energy_rating: 'A (42 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Courchevel 1850', 'Ski Chalet', 'Bellecôte', 'Lagoon Pool', 'Ski-In Ski-Out', 'Nightclub'],
    created_at: '2026-04-20T11:00:00Z',
    updated_at: '2026-10-02T16:00:00Z'
  },
  {
    id: 'KP-LEVESINET-011',
    name: 'Hôtel Particulier & Parc Privé, Le Vésinet',
    slug: 'hotel-particulier-parc-prive-le-vesinet',
    headline: 'Historic 900 m² 19th-Century Lakefront Residence with 8,000 m² Private Park 20 Minutes from Paris',
    description: 'Located in the historic protected park-city of Le Vésinet, just 20 minutes west of central Paris. Set within 8,000 m² of private wooded parkland with private access to the Grand Lac, this 900 m² residence offers monumental reception salons, an indoor heated pool pavilion, and authentic historic woodwork.',
    property_type: 'Private Mansion',
    address: 'Allée des Lacs, 78110 Le Vésinet',
    city: 'Le Vésinet',
    state_region: 'Île-de-France',
    country: 'France',
    cadastral_id: '78650-000-LC-0078',
    land_registry_ref: 'VERSAILLES-VOL-2024-P-4401',
    asking_price: 19500000,
    currency: 'EUR',
    living_area_sqm: 900,
    land_area_sqm: 8000,
    bedrooms: 8,
    bathrooms: 9,
    reception_rooms: 4,
    floor_level: '3 Levels + Garden Wellness Wing',
    year_built: 1888,
    architectural_style: '19th-Century French Aristocratic Chateau-Villa',
    notary_jurisdiction: 'Chambre des Notaires des Yvelines (Versailles / Saint-Germain)',
    legal_status: 'AVAILABLE',
    features: [
      '8,000 m² private park bordering the lake with private boat pontoon',
      'Heated indoor swimming pool located in glass-vaulted orangery',
      'Independent 3-bedroom caretaker / guest house at estate entrance',
      'Wine cellar and original historic carriage house garage for 4 cars'
    ],
    key_amenities: ['Lakefront', 'Private Park', 'Indoor Pool', 'Historic Heritage', 'Guest House', 'Paris West', 'Garage'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Classified Site Heritage & Environmental Approval Cleared',
    tax_compliance_status: 'Clean Title Registered with Versailles Land Registry',
    energy_rating: 'C (128 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Le Vésinet', 'Paris West', 'Private Park', 'Lakefront', 'Historic Mansion', 'Indoor Pool'],
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-09-22T13:00:00Z'
  },
  {
    id: 'KP-GRETZ-012',
    name: 'Château Historique de Gretz-Armainvilliers',
    slug: 'chateau-historique-gretz-armainvilliers',
    headline: 'Monumental 2,500 m² Royal Château with 75 Hectares of Private Forest, Lakes & Equestrian Center',
    description: 'One of the most illustrious royal estates in France, situated 35 km east of Paris in Gretz-Armainvilliers. Boasting 2,500 m² of royal living quarters, 30 lavish suites, monumental banquet halls, private lakes, equestrian polo fields, and 75 hectares of completely private walled forest.',
    property_type: 'Château',
    address: 'Domaine d\'Armainvilliers, 77220 Gretz-Armainvilliers',
    city: 'Gretz-Armainvilliers',
    state_region: 'Île-de-France',
    country: 'France',
    cadastral_id: '77215-000-AR-0001',
    land_registry_ref: 'MELUN-VOL-2023-P-6612',
    asking_price: 65000000,
    currency: 'EUR',
    living_area_sqm: 2500,
    land_area_sqm: 750000,
    bedrooms: 30,
    bathrooms: 32,
    reception_rooms: 8,
    floor_level: 'Royal Château & Multiple Outbuildings',
    year_built: 1884,
    architectural_style: 'French Royal Historic Château',
    notary_jurisdiction: 'Chambre des Notaires de Seine-et-Marne (Melun)',
    legal_status: 'AVAILABLE',
    features: [
      '75 hectares of enclosed private forest with 3 natural private lakes',
      'Professional equestrian complex with 20 horse stalls and indoor riding arena',
      'Private helicopter pad and staff village with 10 independent staff apartments',
      'Grand ballroom seating 200 guests with gilded chandeliers and marble floors'
    ],
    key_amenities: ['Royal Chateau', '75 Hectares Forest', 'Equestrian Center', 'Private Lakes', 'Helipad', 'Ballroom', 'Staff Village'],
    legal_title_type: 'Estate Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Forestry Management Plan (PSG) & Heritage Registry Active',
    tax_compliance_status: 'Monuments Historiques Exemption & Fiscal Title Verified',
    energy_rating: 'D (195 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Château', 'Gretz-Armainvilliers', 'Equestrian', 'Forest', 'Lakes', 'Royal Palace', 'Trophy Asset'],
    created_at: '2026-05-10T12:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'KP-PARIS-013',
    name: 'Hôtel Particulier Direct Parc Monceau, Paris 8ème',
    slug: 'hotel-particulier-parc-monceau-paris-8',
    headline: '580 m² Aristocratic Mansion with Direct Private Gate to Parc Monceau, Courtyard & Rooftop Spa',
    description: 'A discreet and private mansion with direct private gated access into Parc Monceau. Offers 580 m² of neoclassical architecture with private south-facing courtyard, grand double-height library, rooftop wellness spa, and underground private garage.',
    property_type: 'Private Mansion',
    address: 'Avenue Van Dyck, 75008 Paris',
    city: 'Paris',
    state_region: 'Île-de-France',
    country: 'France',
    cadastral_id: '75108-000-VD-0014',
    land_registry_ref: 'PARIS-VOL-2024-P-1920',
    asking_price: 24000000,
    currency: 'EUR',
    living_area_sqm: 580,
    land_area_sqm: 350,
    bedrooms: 6,
    bathrooms: 7,
    reception_rooms: 3,
    floor_level: '4 Storeys with Private Elevator',
    year_built: 1902,
    architectural_style: 'Neoclassical Parisian Mansion',
    notary_jurisdiction: 'Chambre des Notaires de Paris (8ème)',
    legal_status: 'AVAILABLE',
    features: [
      'Direct private key access into Parc Monceau',
      'Private paved inner courtyard with parking for 3 vehicles',
      'Rooftop terrace with panoramic views of the park & Eiffel Tower',
      'Master suite with private cedar sauna and Carrara marble jacuzzi'
    ],
    key_amenities: ['Parc Monceau Direct Access', 'Private Mansion', 'Courtyard', 'Elevator', 'Rooftop Spa', 'Wine Cellar'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Verified & Registered with Cadastre de Paris',
    tax_compliance_status: 'Cleared Clean Title',
    energy_rating: 'C (118 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Paris', 'Parc Monceau', 'Private Mansion', 'Paris 8', 'Courtyard', 'Luxury'],
    created_at: '2026-05-20T10:00:00Z',
    updated_at: '2026-09-18T16:00:00Z'
  },
  {
    id: 'KP-MYKONOS-014',
    name: 'Villa Cycladique Panoramique, Aleomandra Mykonos',
    slug: 'villa-cycladique-panoramique-aleomandra-mykonos',
    headline: '550 m² Waterfront Cycladic Villa with Sunset Views over Delos Island & Sea Infinity Pool',
    description: 'Perched on the waterfront rocks of Aleomandra in Mykonos, this 550 m² whitewashed Cycladic villa offers direct sunset views over the ancient sacred island of Delos, featuring 6 en-suite suites, 4,000 m² of private grounds, and private sea swimming platform access.',
    property_type: 'Villa',
    address: 'Aleomandra Coast, Mykonos 84600',
    city: 'Mykonos',
    state_region: 'Cyclades',
    country: 'Greece',
    cadastral_id: 'GR-MYK-2024-AL-0033',
    land_registry_ref: 'KTHMATOLOGIO-MYKONOS-551',
    asking_price: 14000000,
    currency: 'EUR',
    living_area_sqm: 550,
    land_area_sqm: 4000,
    bedrooms: 6,
    bathrooms: 7,
    reception_rooms: 2,
    floor_level: '2 Levels Cascading to Sea',
    year_built: 2022,
    architectural_style: 'Modern Cycladic Organic Luxury',
    notary_jurisdiction: 'Notary Office of Mykonos / Syros Registry',
    legal_status: 'AVAILABLE',
    features: [
      'Frontline panoramic sunset view over the Aegean and Delos Island',
      '22-meter sea-facing infinity pool with built-in underwater sound system',
      'Direct private stone pathway down to the Aegean swimming platform',
      'Helicopter landing pad on property grounds'
    ],
    key_amenities: ['Waterfront', 'Sunset Delos View', 'Infinity Pool', 'Helipad', 'Private Sea Access', 'Mykonos'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Greek National Cadastre (Ktimatologio) & Forestry Clear',
    tax_compliance_status: 'Building Permit Legalization (Law 4495) Fully Cleared',
    energy_rating: 'A (48 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Mykonos', 'Waterfront', 'Sunset View', 'Delos', 'Cyclades', 'Infinity Pool'],
    created_at: '2026-06-01T14:00:00Z',
    updated_at: '2026-09-15T11:00:00Z'
  },
  {
    id: 'KP-AIX-015',
    name: 'Bastide Provençale Restaurée, Aix-en-Provence',
    slug: 'bastide-provencale-restauree-aix-en-provence',
    headline: '520 m² 18th-Century Historic Bastide with 1.2 Hectares of Lavender Fields, Pool & Tennis Court',
    description: 'Located in the countryside of Aix-en-Provence, this 520 m² authentic 18th-century stone bastide has been restored by master artisans. Surrounded by 12,000 m² of landscaped grounds with lavender fields, century-old plane trees, heated swimming pool, and private championship tennis court.',
    property_type: 'House',
    address: 'Chemin de la Sainte-Victoire, 13100 Aix-en-Provence',
    city: 'Aix-en-Provence',
    state_region: 'Provence-Alpes-Côte d\'Azur',
    country: 'France',
    cadastral_id: '13001-000-SV-0089',
    land_registry_ref: 'AIX-VOL-2024-P-7712',
    asking_price: 8900000,
    currency: 'EUR',
    living_area_sqm: 520,
    land_area_sqm: 12000,
    bedrooms: 6,
    bathrooms: 7,
    reception_rooms: 3,
    floor_level: '2 Storeys + Annex Cottage',
    year_built: 1789,
    architectural_style: 'Authentic Provençal Stone Bastide',
    notary_jurisdiction: 'Chambre des Notaires d\'Aix-en-Provence',
    legal_status: 'AVAILABLE',
    features: [
      '12,000 m² landscaped estate with lavender fields, olive grove and fountain courtyard',
      'Heated stone swimming pool with traditional pool house & summer kitchen',
      'Private synthetic championship tennis court',
      'Autonomous guest cottage and wine tasting cellar'
    ],
    key_amenities: ['Lavender Fields', 'Tennis Court', 'Stone Pool', 'Historic Bastide', 'Olive Grove', 'Aix-en-Provence'],
    legal_title_type: 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Registered Agricultural & Residential Boundary Validated',
    tax_compliance_status: 'Cleared Clean Title with Notaire d\'Aix',
    energy_rating: 'B (82 kWh/m²/year)',
    images: {
      hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    tags: ['Aix-en-Provence', 'Provence', 'Bastide', 'Lavender', 'Tennis', 'Historic House'],
    created_at: '2026-06-15T09:00:00Z',
    updated_at: '2026-09-10T12:00:00Z'
  }
];
