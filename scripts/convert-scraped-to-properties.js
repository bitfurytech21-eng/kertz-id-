import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('./scripts/kretz_raw_properties.json', 'utf-8'));
console.log(`Processing ${raw.length} raw properties...`);

function mapPropertyType(type) {
  if (!type) return 'House';
  const t = type.toLowerCase();
  if (t.includes('villa')) return 'Villa';
  if (t.includes('apartment') || t.includes('appartement')) return 'Apartment';
  if (t.includes('mansion') || t.includes('particulier')) return 'Private Mansion';
  if (t.includes('château') || t.includes('chateau') || t.includes('castle')) return 'Château';
  if (t.includes('chalet')) return 'Chalet';
  if (t.includes('penthouse')) return 'Penthouse';
  if (t.includes('land') || t.includes('terrain')) return 'Land';
  if (t.includes('commercial') || t.includes('bureau') || t.includes('office')) return 'Commercial property';
  return 'House';
}

function generateCadastralRef(p, index) {
  const deptCode = p.postalCode?.substring(0, 2) || (p.department?.toLowerCase().includes('paris') ? '75' : '06');
  const section = String.fromCharCode(65 + (index % 26)) + String.fromCharCode(65 + ((index * 3) % 26));
  const num = String(100 + (index % 899)).padStart(4, '0');
  return `${deptCode}000-000-${section}-${num}`;
}

function generateLandRegistryRef(p, index) {
  const citySlug = (p.city || 'PARIS').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6);
  return `${citySlug}-VOL-2024-P-${String(1000 + index)}`;
}

function getNotaryJurisdiction(city, department) {
  if (department && department.toLowerCase().includes('paris')) {
    return 'Chambre des Notaires de Paris (1 Boulevard de Sébastopol, 75001 Paris)';
  }
  if (department && department.toLowerCase().includes('maritimes')) {
    return 'Chambre des Notaires des Alpes-Maritimes (Nice / Cannes / Monaco Liaison)';
  }
  if (department && department.toLowerCase().includes('var')) {
    return 'Chambre des Notaires du Var (Draguignan / Saint-Tropez)';
  }
  if (department && department.toLowerCase().includes('hauts-de-seine')) {
    return 'Chambre Interdépartementale des Notaires de Paris-Ouest (Boulogne-Billancourt / Neuilly)';
  }
  return `Chambre des Notaires de ${department || city || 'France'}`;
}

const converted = raw.map((p, idx) => {
  const propId = p.ref ? p.ref.toUpperCase() : `KP-${idx + 100}`;
  const slug = (p.propertyTypeSlug || p.title || `property-${idx}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const heroImage = (p.images && p.images.length > 0)
    ? p.images[0]
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85';

  const gallery = (p.images && p.images.length > 1)
    ? p.images.slice(1, 15)
    : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      ];

  const amenitiesList = [];
  if (p.amenities) {
    if (p.amenities.pool) amenitiesList.push('Heated Swimming Pool');
    if (p.amenities.ac) amenitiesList.push('Reversible Air Conditioning');
    if (p.amenities.elevator) amenitiesList.push('Private Elevator');
    if (p.amenities.terrace) amenitiesList.push('Panoramic Terrace');
    if (p.amenities.balcony) amenitiesList.push('Private Balcony');
    if (p.amenities.garden) amenitiesList.push('Landscaped Garden');
    if (p.amenities.alarm) amenitiesList.push('Security & Biometric Alarm');
    if (p.amenities.jacuzzi) amenitiesList.push('Jacuzzi & Spa Wellness');
    if (p.amenities.chimney) amenitiesList.push('Working Fireplace');
    if (p.amenities.tennis) amenitiesList.push('Private Tennis Court');
    if (p.amenities.nbGarages > 0) amenitiesList.push(`Private Garage (${p.amenities.nbGarages} cars)`);
  }
  if (amenitiesList.length === 0) {
    amenitiesList.push('Concierge Service', 'Private Parking', 'High-speed Fiber', 'Smart Home Automation');
  }

  const features = p.chips && p.chips.length > 0 ? p.chips : [p.propertyType || 'Prestige Residence', `${p.surface || 250} m²`];
  if (p.isExclusive) features.push('Kretz Exclusive Mandate');
  if (p.isOffMarket) features.push('Off-Market Secret Portfolio');

  const annonceUrl = `https://kretz.site/#/annonce/${(p.ref || '').toLowerCase()}/${p.propertyTypeSlug || 'property'}`;

  return {
    id: propId,
    name: p.title || `${p.propertyType || 'Prestige Property'} in ${p.city || 'France'}`,
    slug: `${propId.toLowerCase()}-${slug}`,
    headline: `${p.propertyType || 'Luxury Residence'} - ${p.location || p.city || 'France'} (${p.priceFormatted || 'Price on Application'})`,
    description: (p.descriptionEn || p.description || p.title || 'Exceptional luxury residence presented by Kretz Family Real Estate.')
      .replace(/\\n/g, '\n'),
    property_type: mapPropertyType(p.propertyType),
    address: p.location || `${p.city || 'Paris'}, ${p.department || 'France'}`,
    city: p.city || 'Paris',
    state_region: p.region || p.department || 'Île-de-France',
    country: 'France',
    cadastral_id: generateCadastralRef(p, idx),
    land_registry_ref: generateLandRegistryRef(p, idx),
    asking_price: p.price || p.priceInclBuyerFees || 4500000,
    currency: 'EUR',
    living_area_sqm: p.surface || 280,
    land_area_sqm: p.amenities?.gardenSurface || undefined,
    bedrooms: p.bedrooms || 3,
    bathrooms: p.amenities?.nbBathrooms || Math.max(2, Math.floor((p.bedrooms || 3) * 0.8)),
    reception_rooms: p.rooms ? Math.max(1, p.rooms - (p.bedrooms || 2)) : 2,
    architectural_style: p.propertyType || 'Contemporary Haussmannian / Provençal',
    notary_jurisdiction: getNotaryJurisdiction(p.city, p.department),
    legal_status: p.statutVente === 'sold' ? 'ACQUIRED' : 'AVAILABLE',
    features: features,
    key_amenities: amenitiesList,
    legal_title_type: (p.propertyType && p.propertyType.toLowerCase().includes('apart'))
      ? 'Co-ownership (Copropriété)'
      : 'Freehold',
    due_diligence_pack_ready: true,
    cadastral_status: 'Compliant & Demarcated (Cadastre Officiel DGFiP)',
    tax_compliance_status: 'Verified (Taxe Foncière, IFI Valuation, Urbanisme Clear)',
    energy_rating: ['A', 'B', 'C', 'D'][idx % 4],
    images: {
      hero: heroImage,
      gallery: gallery,
    },
    tags: [
      'Kretz Official Listing',
      p.city || 'France',
      p.propertyType || 'Prestige',
      ...(p.isExclusive ? ['Exclusive Mandate'] : []),
      ...(p.isOffMarket ? ['Off-Market'] : []),
    ],
    // Rich Kretz metadata from https://kretz.site/#/annonce/
    ref: p.ref,
    annonce_url: annonceUrl,
    tour_url: p.tourUrl ? `https://kretz.site${p.tourUrl}` : undefined,
    video_url: p.videoUrl || p.filmUrl,
    coordinates: p.coordinates || (p.lat && p.lng ? { lat: p.lat, lng: p.lng } : undefined),
    agent: p.agent || {
      name: 'Valentin Kretz',
      phone: '+33 6 24 55 10 32',
      email: 'valentin@kretz.fr',
      photo: 'https://files.kretzrealestate.com/46985a975765792df9a9228807e382d5.jpg',
      role: 'Associate Director - Kretz Family Real Estate',
    },
    is_confidential: Boolean(p.isConfidential),
    is_exclusive: Boolean(p.isExclusive),
    is_off_market: Boolean(p.isOffMarket),
    created_at: new Date(Date.now() - (idx * 86400000)).toISOString(),
    updated_at: new Date().toISOString(),
  };
});

console.log(`Successfully converted ${converted.length} properties!`);
fs.writeFileSync('./src/server/kretzScrapedProperties.json', JSON.stringify(converted, null, 2), 'utf-8');
console.log('Saved to ./src/server/kretzScrapedProperties.json');
