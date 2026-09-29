/* UpNow — Vertical → Offering → (search fields, price basis, filters, lead action, next steps).
   Every offering declares its own filter defs; the search bar, pills, drawer, matching engine,
   listing facts and mock data generator all read from the same declarations. */
(function () {
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const pickN = (a, n) => { const c = [...a], o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); return o; };
  const between = (a, b, step = 1) => Math.round((a + rnd() * (b - a)) / step) * step;
  const chance = p => rnd() < p;

  const AREAS = [
    { id: 'dubai-marina', n: 'Dubai Marina', x: 16, y: 64 }, { id: 'jbr', n: 'JBR', x: 10, y: 58 }, { id: 'jlt', n: 'JLT', x: 22, y: 74 },
    { id: 'palm-jumeirah', n: 'Palm Jumeirah', x: 18, y: 36 }, { id: 'al-barsha', n: 'Al Barsha', x: 34, y: 60 }, { id: 'jvc', n: 'JVC', x: 32, y: 84 },
    { id: 'dubai-hills', n: 'Dubai Hills', x: 46, y: 70 }, { id: 'arabian-ranches', n: 'Arabian Ranches', x: 48, y: 90 }, { id: 'al-quoz', n: 'Al Quoz', x: 46, y: 50 },
    { id: 'business-bay', n: 'Business Bay', x: 62, y: 46 }, { id: 'downtown', n: 'Downtown Dubai', x: 60, y: 38 }, { id: 'difc', n: 'DIFC', x: 66, y: 32 },
    { id: 'jumeirah', n: 'Jumeirah', x: 50, y: 24 }, { id: 'creek-harbour', n: 'Dubai Creek Harbour', x: 76, y: 34 }, { id: 'deira', n: 'Deira', x: 82, y: 18 },
    { id: 'mirdif', n: 'Mirdif', x: 92, y: 42 }, { id: 'silicon-oasis', n: 'Dubai Silicon Oasis', x: 86, y: 70 }
  ];
  const areaById = Object.fromEntries(AREAS.map(a => [a.id, a]));
  const areaName = id => (areaById[id] || {}).n || id;
  const BLD = {
    'dubai-marina': ['Marina Gate', 'Cayan Tower', 'Sparkle Towers'], jbr: ['Rimal 3', 'Sadaf 5'], jlt: ['Cluster D', 'Lake Terrace'], 'palm-jumeirah': ['Shoreline', 'Oceana', 'Tiara Residences'],
    'al-barsha': ['Grand Horizon'], jvc: ['Belgravia', 'Bloom Towers'], 'dubai-hills': ['Park Heights', 'Golf Place', 'Sidra'], 'arabian-ranches': ['Mirador', 'Saheel'], 'al-quoz': ['Al Khail Gate'],
    'business-bay': ['Executive Towers', 'Paramount'], downtown: ['Burj Vista', 'Boulevard Point', 'Act One'], difc: ['Index Tower', 'Sky Gardens'], jumeirah: ['City Walk', 'La Mer'],
    'creek-harbour': ['Creek Rise', 'Harbour Views'], deira: ['Al Rigga'], mirdif: ['Uptown Mirdif'], 'silicon-oasis': ['Binghatti Stars']
  };
  const MARINAS = ['dubai-marina', 'dubai-marina', 'palm-jumeirah', 'jbr', 'creek-harbour'];
  const phone = () => '+9715' + pick(['0', '2', '5', '6', '8']) + between(1000000, 9999999);
  const PEOPLE = ['Tariq Hassan', 'Aisha Khan', 'Omar Nasser', 'Priya Sharma', 'Daniel Petrov', 'Fatima Al Mansoori', 'Rahul Mehta', 'Layla Haddad', 'Marco Rossi', 'Sara Farouk'];

  /* ---------- def builders ---------- */
  const o = arr => arr.map(x => Array.isArray(x) ? { v: String(x[0]), l: x[1] } : { v: String(x), l: String(x) });
  const sel = (id, label, opts, x = {}) => ({ id, type: 'select', label, options: o(opts), ...x });
  const mul = (id, label, opts, x = {}) => ({ id, type: 'multi', label, options: o(opts), ...x });
  const tog = (id, label, x = {}) => ({ id, type: 'toggle', label, ...x });
  const date = (id, label, x = {}) => ({ id, type: 'date', label, field: 'avail', ...x });
  const gte = (id, label, opts, gen, x = {}) => sel(id, label, opts, { test: (lv, v) => lv >= +v, gen, ...x });
  const lte = (id, label, opts, gen, x = {}) => sel(id, label, opts, { test: (lv, v) => lv <= +v, gen, ...x });
  const price = (label, presets) => ({ id: 'price', type: 'range', label, unit: 'AED', presets: typeof presets === 'function' ? presets : () => presets });
  const rating = () => sel('rating', 'Rating', [['4.5', '4.5★ & up'], ['4', '4★ & up']], { get: l => l.rating, test: (lv, v) => lv >= +v, nogen: 1 });
  const TIME = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']];
  const LANGS = ['English', 'Arabic', 'Hindi', 'Russian', 'French'];
  const lab = (def, v) => ((def.options || []).find(x => x.v === String(v)) || {}).l || v;

  /* ---------- VERTICALS & OFFERINGS ----------
     Search fields (4) and filters (4) per offering follow the UpNow platform blueprint exactly.
     `fields` = the segmented search bar; every other def = "More filters". 'loc' = location segment. */
  const V = {};
  const AREA_OPTS = AREAS.map(a => [a.id, a.n]);
  const INSURERS = ['Daman', 'AXA', 'Bupa', 'MetLife', 'Cigna', 'Direct billing'];
  const ins = () => mul('insurance', 'Insurance accepted', INSURERS, { k: 4 });
  const lang = (id = 'language', label = 'Language') => mul(id, label, LANGS, { gen: () => ['English', ...pickN(LANGS.slice(1), between(0, 2))] });
  const L = (d, id) => lab(d, id);

  V.spaces = { id: 'spaces', label: 'Spaces', icon: 'building', blurb: 'Live, stay, work, gather, play, leisure, store and park.', hero: 'img/hero.jpg', offers: [
    { id: 'live', label: 'Live', h1: 'Homes for rent', basis: 'AED / month or year', hero: 'img/hero.jpg', img: ['img/apt1.jpg', 'img/apt2.jpg', 'img/apt3.jpg', 'img/apt4.jpg', 'img/villa1.jpg'], n: 16,
      action: 'Contact / apply', flow: ['Inquiry', 'Viewing', 'Application', 'Agreement', 'Handover', 'Occupancy'], people: 1, org: ['Skyline Realty', 'Palmview Properties', 'Harbour & Co.', 'Private owner'],
      fields: ['loc', 'spaceType', 'beds', 'price'],
      defs: [
        sel('spaceType', 'Space type', [['residential', 'Residential home'], ['serviced', 'Serviced residence'], ['coliving', 'Co-living / shared']]),
        sel('beds', 'Bedrooms / size', [['0', 'Studio'], ['1', '1 bed'], ['2', '2 beds'], ['3', '3 beds'], ['4', '4+ beds']], { gen: () => String(pick([0, 1, 1, 2, 2, 3, 4])) }),
        price('Budget', [[null, 60000], [60000, 120000], [120000, 200000], [200000, null]]),
        sel('unitType', 'Apartment / villa / room', [['apartment', 'Apartment'], ['villa', 'Villa'], ['townhouse', 'Townhouse'], ['room', 'Room']]),
        sel('furnishing', 'Furnished', [['furnished', 'Furnished'], ['semi', 'Semi-furnished'], ['unfurnished', 'Unfurnished']]),
        date('movein', 'Move-in date'),
        mul('amenities', 'Amenities', ['Balcony', 'Pool', 'Gym', 'Covered parking', 'Sea view', 'Pets allowed', "Maid's room"], { all: 1, k: 5 })
      ],
      post: a => { if (a.unitType === 'room') a.beds = '1'; a.sqft = a.beds === '0' ? between(400, 560, 10) : between(700, 950, 10) * +a.beds * (a.unitType === 'villa' ? 1.6 : 1); },
      price: a => Math.round([48000, 78000, 120000, 175000, 260000][+a.beds] * (a.unitType === 'villa' ? 1.5 : a.unitType === 'room' ? .35 : 1) * (0.8 + rnd() * .5) / 1000) * 1000, unit: () => '/year',
      title: (a, c) => `${a.beds === '0' ? 'Studio' : a.beds + '-Bed'} ${L(c.def('unitType'), a.unitType)}${a.amenities.includes('Sea view') ? ' with Sea View' : a.furnishing === 'furnished' ? ' · Furnished' : ''}`,
      meta: a => [['bed', a.beds === '0' ? 'Studio' : a.beds + ' beds'], ['area', Math.round(a.sqft).toLocaleString() + ' sqft'], ['home', { furnished: 'Furnished', semi: 'Semi-furnished', unfurnished: 'Unfurnished' }[a.furnishing]]] },

    { id: 'stay', label: 'Stay', h1: 'Holiday stays', basis: 'AED / night or day', hero: 'img/hotel1.jpg', img: ['img/hotel1.jpg', 'img/hotel2.jpg', 'img/villa1.jpg', 'img/apt2.jpg'], n: 10,
      action: 'Request / reserve', flow: ['Reservation', 'Payment', 'Check-in', 'Stay', 'Review'], org: ['Holiday home operator'], names: ['Silkhaus', 'Frank Porter', 'Nomad Homes', 'Desert Glamp Co.', 'Private host'],
      fields: ['loc', 'checkin', 'checkout', 'guests'], locLabel: 'Destination',
      defs: [
        date('checkin', 'Check-in'), date('checkout', 'Check-out', { noMatch: 1 }),
        gte('guests', 'Guests', [['2', '1–2 guests'], ['4', '3–4 guests'], ['6', '5–6 guests'], ['8', '7+ guests']], () => pick([2, 4, 4, 6, 8, 10]), { field: 'maxGuests', fmt: v => 'Up to ' + v }),
        sel('stayType', 'Home / room / tent', [['home', 'Entire home'], ['room', 'Private room'], ['tent', 'Tent / glamping']]),
        sel('beds', 'Bedrooms', [['0', 'Studio'], ['1', '1'], ['2', '2'], ['3', '3+']]),
        mul('amenities', 'Amenities', ['Pool', 'Beach access', 'Fast Wi-Fi', 'Full kitchen', 'Free parking', 'Self check-in'], { all: 1, k: 4 }),
        sel('cancellation', 'Cancellation', [['free', 'Free cancellation'], ['moderate', 'Moderate'], ['strict', 'Strict']])
      ],
      price: a => between(260, 520, 10) * (a.stayType === 'room' ? .5 : a.stayType === 'tent' ? .8 : 1) * Math.max(1, +a.beds * .8), unit: () => '/night',
      title: (a, c) => `${pick(['Cosy', 'Stylish', 'Bright', 'Luxury'])} ${L(c.def('stayType'), a.stayType)} in ${c.areaN}`,
      meta: (a, l) => [['bed', a.beds === '0' ? 'Studio' : a.beds + ' BR'], ['users', 'Up to ' + a.maxGuests], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'work', label: 'Work', h1: 'Offices & coworking', basis: 'AED / hour, day, month or year', hero: 'img/office1.jpg', img: ['img/office1.jpg', 'img/office2.jpg', 'img/office3.jpg', 'img/loft1.jpg'], n: 10,
      action: 'Contact / reserve', flow: ['Inquiry', 'Availability', 'Reservation / agreement', 'Access', 'Usage', 'Settlement'], org: ['Workspace operator'], names: ['Nook Coworking', 'Letswork', 'Regus', 'Servcorp', 'The Bureau'],
      fields: ['loc', 'workspace', 'term', 'people'],
      defs: [
        sel('workspace', 'Workspace type', [['coworking', 'Coworking'], ['business', 'Business centre'], ['serviced', 'Serviced office'], ['studio', 'Studio']]),
        sel('term', 'Date / term', [['hourly', 'Hourly'], ['daily', 'Daily'], ['monthly', 'Monthly'], ['yearly', 'Yearly']], { many: 1 }),
        gte('people', 'People', [['1', '1 person'], ['4', '2–4'], ['10', '5–10'], ['20', '11+']], () => pick([1, 4, 6, 10, 20, 40]), { field: 'capacity', fmt: v => 'Up to ' + v }),
        sel('space', 'Office / desk / meeting room', [['office', 'Private office'], ['hotdesk', 'Hot desk'], ['dedicated', 'Dedicated desk'], ['meeting', 'Meeting room']]),
        sel('privacy', 'Private / shared', [['private', 'Private'], ['shared', 'Shared']]),
        mul('equipment', 'Equipment', ['Screen & AV', 'Printer', 'Phone booths', 'Whiteboard', 'Lockers'], { all: 1, k: 4 }),
        sel('access', 'Access', [['247', '24/7 access'], ['business', 'Business hours'], ['extended', 'Extended hours']])
      ],
      price: a => ({ office: 4800, hotdesk: 900, dedicated: 1600, meeting: 250 }[a.space]) * (0.8 + rnd() * 0.6), unit: (l) => l.a.space === 'meeting' ? '/hour' : '/month',
      title: (a, c) => `${L(c.def('space'), a.space)} · ${c.name}`,
      meta: a => [['users', 'Up to ' + a.capacity], ['clock', { '247': '24/7', business: 'Business hours', extended: 'Extended hours' }[a.access]], ['building', a.privacy === 'private' ? 'Private' : 'Shared']] },

    { id: 'gather', label: 'Gather', h1: 'Event venues', basis: 'AED / hour or day', hero: 'img/venue2.jpg', img: ['img/venue1.jpg', 'img/venue2.jpg', 'img/office1.jpg'], n: 9,
      action: 'Request / reserve', flow: ['Inquiry', 'Availability', 'Reservation', 'Deposit', 'Event', 'Settlement'], org: ['Venue team'], names: ['The Grand Ballroom', 'Skyline Rooftop', 'Marina Terrace', 'The Loft Studio', 'Palm Garden Lawn'],
      fields: ['loc', 'date', 'time', 'guests'],
      defs: [
        date('date', 'Date'), sel('time', 'Time', [...TIME, ['fullday', 'Full day']], { many: 1, field: 'slots' }),
        gte('guests', 'Guests', [['20', 'Up to 20'], ['50', '21–50'], ['100', '51–100'], ['200', '100+']], () => pick([20, 40, 60, 120, 250, 400]), { field: 'capacity', fmt: v => v + ' guests' }),
        sel('venueType', 'Venue type', [['ballroom', 'Ballroom'], ['rooftop', 'Rooftop'], ['meeting', 'Meeting room'], ['garden', 'Garden & outdoor'], ['studio', 'Studio / loft']]),
        sel('layout', 'Capacity', [['seated', 'Seated banquet'], ['standing', 'Standing reception'], ['theatre', 'Theatre'], ['classroom', 'Classroom']], { many: 1 }),
        sel('catering', 'Catering', [['inhouse', 'In-house catering'], ['outside', 'Outside catering allowed'], ['none', 'No catering']]),
        mul('equipment', 'Equipment', ['AV & screen', 'Sound system', 'Stage', 'Lighting rig', 'Wi-Fi'], { all: 1, k: 4 })
      ],
      price: a => Math.round(a.capacity * between(9, 16) / 50) * 50 + 300, unit: () => '/hour',
      title: (a, c) => c.name + ' · ' + L(c.def('venueType'), a.venueType),
      meta: a => [['users', 'Up to ' + a.capacity], ['clock', a.slots.length + ' slots'], ['tool', { inhouse: 'Catering', outside: 'Outside catering', none: 'Dry hire' }[a.catering]]] },

    { id: 'play', label: 'Play', h1: 'Courts, pitches & activities', basis: 'AED / hour or session', hero: 'img/padel1.jpg', img: ['img/padel1.jpg', 'img/padel2.jpg'], n: 9,
      action: 'Book', flow: ['Booking', 'Payment', 'Access', 'Play', 'Review'], org: ['Sports operator'], names: ['Padel Pro Club', 'Just Padel', 'Smash Arena', 'Pitch 5', 'Climb Central'],
      fields: ['loc', 'date', 'time', 'players'],
      defs: [
        date('date', 'Date'), sel('time', 'Time', [...TIME, ['late', 'Late night']], { many: 1, field: 'slots' }),
        gte('players', 'Players', [['2', '2'], ['4', '4'], ['10', '5–10'], ['22', '11+']], () => pick([4, 4, 10, 22]), { field: 'maxPlayers', fmt: v => 'Up to ' + v }),
        sel('activity', 'Court / pitch / activity', [['padel', 'Padel court'], ['tennis', 'Tennis court'], ['football', 'Football pitch'], ['basketball', 'Basketball court'], ['climbing', 'Climbing wall']]),
        sel('setting', 'Indoor / outdoor', [['indoor', 'Indoor (A/C)'], ['outdoor', 'Outdoor']]),
        mul('equipment', 'Equipment', ['Racket / ball rental', 'Changing rooms', 'Showers', 'Coaching available'], { all: 1, k: 3 }),
        rating()
      ],
      price: a => between(150, 320, 10) + (a.setting === 'indoor' ? 80 : 0) + (a.activity === 'football' ? 200 : 0), unit: () => '/hour',
      title: (a, c) => `${c.name} · ${a.setting === 'indoor' ? 'Indoor' : 'Outdoor'} ${L(c.def('activity'), a.activity)}`,
      meta: (a, l) => [['pin', a.setting === 'indoor' ? 'Indoor · A/C' : 'Outdoor'], ['users', 'Up to ' + a.maxPlayers], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'leisure', label: 'Leisure', h1: 'Yachts, pools & leisure spaces', basis: 'AED / hour or day', hero: 'img/yacht2.jpg', img: ['img/yacht1.jpg', 'img/yacht2.jpg', 'img/villa3.jpg'], n: 9, locs: MARINAS,
      action: 'Request / reserve', flow: ['Inquiry', 'Reservation', 'Deposit', 'Guest details', 'Experience', 'Settlement'], org: ['Leisure operator'], names: ['Xclusive Yachts', 'Marina Charters', 'Blue Lagoon', 'Palm Pool Villa', 'Sunset Camp'],
      fields: ['loc', 'date', 'duration', 'guests'], locLabel: 'Location / marina',
      defs: [
        date('date', 'Date'),
        lte('duration', 'Duration', [['2', '2 hours'], ['3', '3 hours'], ['4', '4 hours'], ['8', 'Full day']], () => pick([2, 2, 3, 4]), { field: 'minHours', fmt: v => v + ' hr minimum' }),
        gte('guests', 'Guests', [['6', 'Up to 6'], ['12', '7–12'], ['20', '13–20'], ['35', '20+']], () => pick([8, 12, 20, 30, 40]), { field: 'capacity', fmt: v => 'Up to ' + v }),
        sel('kind', 'Yacht / pool / camp / leisure space', [['yacht', 'Yacht'], ['pool', 'Private pool'], ['camp', 'Desert camp'], ['beach', 'Beach cabana']]),
        sel('crew', 'Crew / host', [['captain', 'Captain / host only'], ['full', 'Full crew & host'], ['self', 'Self-hosted']]),
        mul('food', 'Food', ['Soft drinks', 'BBQ', 'Catering', 'Cake & décor'], { all: 1 }),
        mul('activities', 'Activities', ['Swimming', 'Fishing', 'Jet ski add-on', 'Water toys', 'Music system'], { all: 1 })
      ],
      price: a => between(450, 1400, 50) * (a.kind === 'yacht' ? 1.3 : .7), unit: () => '/hour',
      title: (a, c) => `${L(c.def('kind'), a.kind)} · ${c.name}`,
      meta: a => [['users', 'Up to ' + a.capacity], ['clock', 'Min ' + a.minHours + ' hrs'], ['check', { captain: 'Host included', full: 'Full crew', self: 'Self-hosted' }[a.crew]]] },

    { id: 'store', label: 'Store', h1: 'Storage & warehouses', basis: 'AED / month or year', hero: 'img/storage1.jpg', img: ['img/storage1.jpg', 'img/office3.jpg'], n: 8, from: 1,
      action: 'Contact / apply', flow: ['Inquiry', 'Viewing', 'Application', 'Agreement', 'Access', 'Usage'], org: ['Storage operator'], names: ['Sentinel Self Storage', 'Store It', 'Boxit', 'Avenue Warehouse'],
      fields: ['loc', 'storageType', 'size', 'term'],
      defs: [
        sel('storageType', 'Storage type', [['personal', 'Personal'], ['business', 'Business stock'], ['documents', 'Documents & archive'], ['vehicle', 'Vehicle / boat']]),
        gte('size', 'Size', [['25', 'Locker (25 sqft)'], ['50', 'Small (50 sqft)'], ['100', 'Medium (100 sqft)'], ['500', 'Large (500+ sqft)']], () => pick([25, 50, 100, 150, 300, 800, 2000]), { field: 'sqft', fmt: v => v + ' sqft' }),
        sel('term', 'Term', [['monthly', 'Monthly'], ['yearly', 'Yearly']], { many: 1 }),
        sel('facility', 'Warehouse / self-storage', [['self', 'Self-storage unit'], ['warehouse', 'Warehouse space']]),
        tog('climate', 'Climate control', { p: .6 }),
        sel('vehicleAccess', 'Vehicle access', [['driveup', 'Drive-up'], ['loading', 'Loading bay'], ['lift', 'Goods lift']], { many: 1 }),
        mul('security', 'Security', ['24/7 CCTV', 'On-site guard', 'Individual alarm', 'PIN access'], { all: 1, k: 3 })
      ],
      post: a => { if (a.facility === 'warehouse') a.sqft = Math.max(a.sqft, 800); },
      price: a => Math.round(a.sqft * between(4, 7) / 10) * 10, unit: () => '/month',
      title: (a, c) => `${a.sqft.toLocaleString()} sqft ${a.facility === 'warehouse' ? 'warehouse' : 'storage unit'} · ${c.name}`,
      meta: a => [['area', a.sqft.toLocaleString() + ' sqft'], ['shield', a.security[0]], ['bolt', a.climate ? 'Climate controlled' : 'Ambient']] },

    { id: 'park', label: 'Park', h1: 'Parking spaces', basis: 'AED / hour, day or month', hero: 'img/parking1.jpg', img: ['img/parking1.jpg', 'img/car1.jpg'], n: 8,
      action: 'Book / request', flow: ['Availability', 'Booking / request', 'Payment', 'Access', 'Parking', 'Completion'], org: ['Private owner', 'Building management'], people: 1,
      fields: ['loc', 'vehicle', 'start', 'duration'],
      defs: [
        sel('vehicle', 'Vehicle type', [['car', 'Car'], ['suv', 'SUV / 4x4'], ['bike', 'Motorbike'], ['van', 'Van']], { many: 1 }),
        date('start', 'Start'),
        sel('duration', 'Duration', [['hourly', 'Hourly'], ['daily', 'Daily'], ['monthly', 'Monthly']], { many: 1 }),
        sel('covered', 'Covered / open', [['covered', 'Covered'], ['basement', 'Basement'], ['open', 'Open air']]),
        sel('reserved', 'Reserved / shared', [['reserved', 'Reserved bay'], ['shared', 'Shared pool']]),
        tog('ev', 'EV charging', { p: .3 }),
        sel('hours', 'Access hours', [['247', '24/7'], ['day', '6am – midnight']])
      ],
      price: () => between(250, 900, 10), unit: () => '/month',
      title: (a, c) => `${L(c.def('covered'), a.covered)} ${a.reserved === 'reserved' ? 'reserved ' : ''}parking · ${c.areaN}`,
      meta: a => [['car', a.vehicle.map(v => ({ car: 'Car', suv: 'SUV', bike: 'Bike', van: 'Van' }[v])).join(', ')], ['clock', a.hours === '247' ? '24/7' : '6am–12am'], ['bolt', a.ev ? 'EV charging' : 'No EV']] }
  ] };

  V.services = { id: 'services', label: 'Services', icon: 'wrench', blurb: 'Cleaning, AC maintenance and salons.', hero: 'img/clean1.jpg', offers: [
    { id: 'cleaning', label: 'Cleaning', h1: 'Cleaning services', basis: 'One-time or recurring', hero: 'img/clean1.jpg', img: ['img/clean1.jpg', 'img/clean2.jpg'], n: 10, coverage: 1, from: 1,
      action: 'Book', flow: ['Booking', 'Assignment', 'Visit', 'Evidence', 'Payment', 'Payout'], org: ['DED-licensed company'], names: ['Sparkle Home Cleaning', 'Maids on Call', 'Fresh Nest', 'Shine & Co.'],
      fields: ['service', 'loc', 'date', 'frequency'],
      defs: [
        sel('service', 'Service', ['Regular clean', 'Deep clean', 'Move-in / move-out', 'Sofa & carpet'], { many: 1 }), date('date', 'Date'),
        sel('frequency', 'Frequency', [['once', 'One-time'], ['weekly', 'Weekly'], ['biweekly', 'Every 2 weeks'], ['contract', 'Monthly contract']], { many: 1 }),
        sel('ptype', 'Property type', ['Apartment', 'Villa', 'Office'], { many: 1 }),
        gte('bedrooms', 'Bedrooms', [['1', 'Studio / 1'], ['2', '2'], ['3', '3'], ['5', '4–5+']], () => pick([3, 4, 5, 6]), { field: 'maxBeds', fmt: v => 'Up to ' + v + ' BR' }),
        tog('materials', 'Materials'),
        gte('cleaners', 'Cleaners', [['1', '1 cleaner'], ['2', '2 cleaners'], ['3', 'Team of 3+']], () => pick([1, 2, 3, 4]), { field: 'team', fmt: v => 'Up to ' + v })
      ],
      price: () => between(32, 65), unit: () => '/hour',
      title: (a, c) => `${a.service[0]} · ${c.name}`,
      meta: (a, l) => [['star', l.rating + ' (' + l.reviews + ')'], ['users', 'Team of ' + a.team], ['check', a.materials ? 'Materials included' : 'Bring your own']] },

    { id: 'ac', label: 'AC maintenance', h1: 'AC maintenance', basis: 'One-time or annual contract', hero: 'img/ac1.jpg', img: ['img/ac1.jpg', 'img/ac2.jpg'], n: 9, coverage: 1, from: 1,
      action: 'Book / quote', flow: ['Assessment', 'Quote', 'Approval', 'Work order', 'Completion'], org: ['DED-licensed company'], names: ['CoolFix Technical', 'Polar AC', 'Breeze HVAC', 'Chill Masters'],
      fields: ['model', 'property', 'units', 'date'],
      defs: [
        sel('model', 'Service model', [['once', 'One-time service'], ['annual', 'Annual contract (AMC)']], { many: 1 }),
        sel('property', 'Property', ['Apartment', 'Villa', 'Office'], { many: 1 }),
        gte('units', 'Units', [['1', '1 unit'], ['3', '2–3 units'], ['6', '4–6 units'], ['10', '7+ units']], () => pick([4, 6, 10, 20]), { field: 'maxUnits', fmt: v => 'Up to ' + v }),
        date('date', 'Preferred date'),
        mul('acType', 'AC type', ['Split', 'Ducted / central', 'Window', 'Cassette'], { k: 4 }),
        tog('emergency', 'Emergency'),
        gte('visits', 'Visits included', [['2', '2+ per year'], ['3', '3+ per year'], ['4', '4+ per year']], () => pick([2, 3, 4]), { fmt: v => v + ' visits / year' }),
        lte('sla', 'SLA', [['4', 'Within 4 hrs'], ['24', 'Within 24 hrs'], ['48', 'Within 48 hrs']], () => pick([4, 24, 24, 48]), { fmt: v => v + ' hrs' })
      ],
      price: () => between(99, 380, 10), unit: () => '/unit',
      title: (a, c) => `AC ${a.model.includes('annual') ? 'annual contract' : 'servicing & repair'} · ${c.name}`,
      meta: a => [['clock', a.sla + 'h response'], ['tool', a.acType.slice(0, 2).join(', ')], ['check', a.visits + ' visits/yr']] },

    { id: 'haircut', label: 'Haircut', h1: 'Haircuts & salons', basis: 'AED / appointment', hero: 'img/salon1.jpg', img: ['img/salon1.jpg', 'img/salon2.jpg'], n: 9, from: 1,
      action: 'Book', flow: ['Booking', 'Confirmation', 'Appointment', 'Payment', 'Review'], org: ['Salon'], names: ['Tips & Toes', 'The Barber Shop', 'Blow Bar', 'Ivy Salon'],
      fields: ['treatment', 'loc', 'date', 'time'],
      defs: [
        sel('treatment', 'Treatment', ["Men's cut", "Women's cut & style", 'Colour', 'Blow-dry', 'Kids cut', 'Beard trim'], { many: 1 }),
        date('date', 'Date'), sel('time', 'Time', TIME, { many: 1, field: 'slots' }),
        sel('setting', 'At home / salon', [['salon', 'In salon'], ['home', 'At home']], { many: 1 }),
        sel('pro', 'Professional', [['male', 'Male stylist'], ['female', 'Female stylist']], { many: 1 }),
        lte('duration', 'Duration', [['30', 'Up to 30 min'], ['45', 'Up to 45 min'], ['60', 'Up to 60 min']], () => pick([30, 45, 60, 90]), { fmt: v => v + ' min' }),
        rating()
      ],
      price: () => between(60, 260, 5), unit: () => '/appointment',
      title: (a, c) => `${a.treatment[0]} · ${c.name}`,
      meta: (a, l) => [['clock', a.duration + ' min'], ['pin', a.setting.includes('home') ? 'Home visit' : 'In salon'], ['star', l.rating + ' (' + l.reviews + ')']] }
  ] };

  V.experiences = { id: 'experiences', label: 'Experiences', icon: 'compass', blurb: 'Safaris, workshops and tours.', hero: 'img/desert1.jpg', offers: [
    { id: 'safari', label: 'Desert safari', h1: 'Desert safaris', basis: 'AED / person / day', hero: 'img/desert1.jpg', img: ['img/desert1.jpg', 'img/desert2.jpg'], n: 9, coverage: 1,
      action: 'Book', flow: ['Booking', 'Guest details', 'Payment', 'Attendance', 'Review'], org: ['DTCM-licensed operator'], names: ['Arabian Adventures', 'Platinum Heritage', 'Desert Rose Tours'],
      fields: ['date', 'guests', 'loc', 'session'], locLabel: 'Pickup area',
      defs: [
        date('date', 'Date'),
        gte('guests', 'Guests', [['2', '1–2'], ['4', '3–4'], ['8', '5–8'], ['15', '9+']], () => pick([6, 10, 20, 40]), { field: 'groupMax', fmt: v => 'Groups up to ' + v }),
        sel('session', 'Session', [['morning', 'Morning'], ['evening', 'Evening'], ['overnight', 'Overnight']], { many: 1 }),
        sel('format', 'Private / shared', [['shared', 'Shared group'], ['private', 'Private']]),
        lang(),
        mul('meals', 'Meals', ['BBQ dinner', 'Breakfast', 'Unlimited drinks'], { all: 1 }),
        sel('transport', 'Transport', [['4x4', '4x4 hotel pickup'], ['own', 'Meet at camp']], { many: 1 })
      ],
      price: a => between(110, 280, 5) * (a.format === 'private' ? 2.2 : 1), unit: () => '/person',
      title: a => `${a.session.includes('overnight') ? 'Overnight Desert Camp' : a.session[0] === 'morning' ? 'Morning Dune Bashing' : 'Evening Red Dunes Safari'}${a.meals.includes('BBQ dinner') ? ' with BBQ' : ''}${a.format === 'private' ? ' (Private)' : ''}`,
      meta: (a, l) => [['users', a.format === 'private' ? 'Private' : 'Up to ' + a.groupMax], ['car', a.transport.includes('4x4') ? 'Hotel pickup' : 'Meet at camp'], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'workshop', label: 'Workshop', h1: 'Workshops', basis: 'AED / session', hero: 'img/workshop1.jpg', img: ['img/workshop1.jpg', 'img/workshop2.jpg'], n: 9,
      action: 'Book', flow: ['Booking', 'Payment', 'Reminder', 'Attendance', 'Certificate'], org: ['Studio'], names: ['Clay Studio DXB', 'The Artsy Room', 'Kitchen Lab', 'Scent Atelier'],
      fields: ['topic', 'date', 'session', 'participants'],
      defs: [
        sel('topic', 'Topic', ['Pottery', 'Painting', 'Cooking', 'Perfume making', 'Photography', 'Calligraphy']),
        date('date', 'Date'), sel('session', 'Session', TIME, { many: 1 }),
        gte('participants', 'Participants', [['1', 'Just me'], ['2', '2'], ['6', '3–6'], ['12', '7+ (team)']], () => pick([6, 8, 12, 20]), { field: 'groupMax', fmt: v => 'Up to ' + v }),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        lang(),
        tog('materials', 'Materials', { p: .7 }),
        lte('age', 'Age', [['6', 'Kids 6+'], ['12', '12+'], ['18', 'Adults']], () => pick([6, 12, 12, 18]), { field: 'minAge', fmt: v => v + '+' })
      ],
      price: () => between(120, 480, 10), unit: () => '/session',
      title: (a, c) => `${a.topic} ${pick(['Workshop', 'Masterclass', 'Taster Session'])} · ${c.name}`,
      meta: (a, l) => [['clock', pick(['2 hrs', '2.5 hrs', '3 hrs'])], ['users', 'Up to ' + a.groupMax], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'tour', label: 'Tour', h1: 'Tours', basis: 'AED / person / day', hero: 'img/desert2.jpg', img: ['img/apt3.jpg', 'img/desert2.jpg', 'img/yacht2.jpg'], n: 9,
      action: 'Book', flow: ['Booking', 'Confirmation', 'Check-in', 'Tour', 'Review'], org: ['DTCM-licensed guide'], names: ['Wanderlust DXB', 'Old Dubai Walks', 'Frying Pan Adventures', 'City Sightseeing'],
      fields: ['loc', 'date', 'guests', 'language'],
      defs: [
        date('date', 'Date'),
        gte('guests', 'Guests', [['2', '1–2'], ['4', '3–4'], ['8', '5–8'], ['15', '9+']], () => pick([8, 12, 20, 40]), { field: 'groupMax', fmt: v => 'Up to ' + v }),
        lang(),
        sel('duration', 'Duration', [['short', 'Under 3 hrs'], ['half', 'Half day'], ['full', 'Full day']]),
        sel('format', 'Private / shared', [['shared', 'Shared group'], ['private', 'Private']]),
        sel('transport', 'Transport', [['pickup', 'Hotel pickup'], ['walk', 'Walking tour'], ['coach', 'Coach']]),
        tog('accessible', 'Accessibility', { p: .35 })
      ],
      price: a => between(90, 260, 5) * (a.format === 'private' ? 2 : 1) * (a.duration === 'full' ? 1.6 : 1), unit: () => '/person',
      title: a => pick(['Old Dubai & Souks', 'Street Food Night', 'Abu Dhabi Grand Mosque Day Trip', 'Architecture & Skyline', 'Hatta Mountain Escape']) + (a.format === 'private' ? ' (Private)' : ' Tour'),
      meta: (a, l) => [['clock', { short: 'Under 3 hrs', half: 'Half day', full: 'Full day' }[a.duration]], ['users', a.language.slice(0, 2).join(', ')], ['star', l.rating + ' (' + l.reviews + ')']] }
  ] };

  V.memberships = { id: 'memberships', label: 'Memberships', icon: 'badge', blurb: 'Gyms and credit packages.', hero: 'img/fit2.jpg', offers: [
    { id: 'gym', label: 'Gym plan', h1: 'Gym memberships', basis: 'AED / month or year', hero: 'img/fit2.jpg', img: ['img/fit2.jpg', 'img/fit1.jpg'], n: 10, from: 1,
      action: 'Join', flow: ['Application', 'Terms', 'Autopay', 'Access', 'Renewal'], org: ['Fitness club'], names: ['GymNation', 'Fitness First', 'Warehouse Gym', 'Train Station', 'Commit Fitness'],
      fields: ['loc', 'access', 'billing', 'start'],
      defs: [
        sel('access', 'Access level', [['single', 'Single club'], ['multi', 'Multi-club'], ['all', 'All-access']]),
        sel('billing', 'Billing period', [['monthly', 'Monthly'], ['annual', 'Annual']], { many: 1 }),
        date('start', 'Start date'),
        gte('branches', 'Branches', [['1', '1+'], ['3', '3+'], ['10', '10+']], a => a.access === 'single' ? 1 : a.access === 'multi' ? pick([3, 5, 8]) : pick([10, 18, 30]), { fmt: v => v + ' branches' }),
        mul('classes', 'Classes', ['Yoga', 'HIIT', 'Spin', 'Pilates', 'Pool'], { all: 1, k: 4 }),
        sel('visits', 'Visits', [['unlimited', 'Unlimited'], ['12', '12 / month'], ['8', '8 / month']]),
        sel('freeze', 'Freeze policy', [['free', 'Free freeze'], ['paid', 'Paid freeze'], ['none', 'No freeze']])
      ],
      price: a => between(120, 420, 10) * (a.access === 'all' ? 1.6 : 1), unit: () => '/month',
      title: (a, c) => `${c.name} · ${L(c.def('access'), a.access)}`,
      meta: a => [['pin', a.branches + ' branch' + (a.branches > 1 ? 'es' : '')], ['check', { unlimited: 'Unlimited visits', '12': '12 visits', '8': '8 visits' }[a.visits]], ['spark', a.classes.length + ' class types']] },

    { id: 'credits', label: 'Credit package', h1: 'Credit packages', basis: 'AED / package', hero: 'img/fit1.jpg', img: ['img/fit1.jpg', 'img/padel2.jpg'], n: 8, from: 1,
      action: 'Buy package', flow: ['Purchase', 'Credits issued', 'Booking', 'Usage', 'Expiry'], org: ['Activity network'], names: ['Privilee', 'ClassPass', 'Urban Pass', 'Kaizen Credits'],
      fields: ['activity', 'loc', 'credits', 'start'],
      defs: [
        sel('activity', 'Activity', ['Fitness classes', 'Padel', 'Swimming', 'Spa & wellness', 'Yoga'], { many: 1 }),
        gte('credits', 'Credits', [['10', '10 credits'], ['20', '20 credits'], ['50', '50 credits'], ['100', '100 credits']], () => pick([20, 50, 100]), { field: 'maxCredits', fmt: v => 'Packs up to ' + v }),
        date('start', 'Start date'),
        gte('validity', 'Validity', [['1', '1 month+'], ['3', '3 months+'], ['6', '6 months+'], ['12', '12 months']], () => pick([1, 3, 6, 12]), { fmt: v => v + ' months' }),
        gte('locations', 'Locations', [['5', '5+ partners'], ['20', '20+ partners'], ['50', '50+ partners']], () => pick([6, 15, 30, 80]), { fmt: v => v + ' partners' }),
        tog('guest', 'Guest access'),
        lte('cancellation', 'Cancellation', [['12', 'Free up to 12h before'], ['24', 'Free up to 24h before']], () => pick([6, 12, 24]), { fmt: v => 'Free up to ' + v + 'h before' })
      ],
      price: a => between(15, 32) * a.maxCredits / 2, unit: () => '/package',
      title: (a, c) => `${c.name} · ${a.activity.slice(0, 2).join(' & ')} Pack`,
      meta: a => [['tag', a.maxCredits + ' credits'], ['cal', a.validity + ' mo validity'], ['pin', a.locations + ' partners']] }
  ] };

  V.programs = { id: 'programs', label: 'Programs', icon: 'grad', blurb: 'Nurseries, schools, universities, courses, camps and academies.', hero: 'img/school1.jpg', offers: [
    { id: 'nursery', label: 'Nursery', h1: 'Nurseries', basis: 'AED / term, month or day', hero: 'img/nursery1.jpg', img: ['img/nursery1.jpg', 'img/school2.jpg'], n: 9, from: 1,
      action: 'Request tour / apply', flow: ['Enquiry', 'Tour', 'Application', 'Consent', 'Enrolment', 'Daily care', 'Authorized pickup'], org: ['KHDA-licensed nursery'], names: ['Little Explorers Nursery', 'Blossom Nursery', 'Kids First Nursery', 'Ladybird Early Learning'],
      fields: ['age', 'curriculum', 'loc', 'start'],
      defs: [
        sel('age', 'Child age', [['0', 'Under 1'], ['1', '1–2 yrs'], ['2', '2–3 yrs'], ['3', '3–4 yrs']], { many: 1, k: 4 }),
        sel('curriculum', 'Curriculum', ['EYFS (British)', 'Montessori', 'Reggio Emilia', 'IB PYP']),
        date('start', 'Start date'),
        sel('fs', 'FS stage', [['pre', 'Pre-FS'], ['fs1', 'FS1'], ['fs2', 'FS2']], { many: 1 }),
        sel('hours', 'Opening hours', [['half', 'Half day'], ['full', 'Full day'], ['extended', 'Extended (7am–6pm)']], { many: 1 }),
        tog('meals', 'Meals'), tog('transport', 'Transport', { p: .4 })
      ],
      price: () => between(6500, 15000, 100), unit: () => '/term',
      title: (a, c) => `${c.name} · ${a.curriculum}`,
      meta: a => [['users', a.age.map(x => ['<1', '1–2', '2–3', '3–4'][+x]).join(', ') + ' yrs'], ['clock', { half: 'Half day', full: 'Full day', extended: 'Extended' }[a.hours[0]]], ['check', a.meals ? 'Meals' : 'Bring lunch']] },

    { id: 'school', label: 'School', h1: 'Schools', basis: 'AED / term or year', hero: 'img/school1.jpg', img: ['img/school1.jpg', 'img/school2.jpg'], n: 10, from: 1,
      action: 'Apply', flow: ['Application', 'Assessment', 'Offer', 'Enrolment', 'Timetable', 'Attendance', 'Results'], org: ['KHDA-registered school'], names: ['Dubai British School', 'GEMS Wellington', 'Repton', 'American Academy', 'Lycée Français'],
      fields: ['year', 'curriculum', 'loc', 'intake'],
      defs: [
        sel('year', 'Year level', ['FS / KG', 'Primary', 'Secondary', 'Sixth form / IB'], { many: 1, k: 4 }),
        sel('curriculum', 'Curriculum', ['British', 'American', 'IB', 'Indian (CBSE)', 'French', 'UAE MoE']),
        sel('intake', 'Intake', ['Sep 2026', 'Jan 2027', 'Apr 2027'], { many: 1 }),
        sel('board', 'IB / British / American / other', [['ib', 'IB World School'], ['bso', 'British (BSO)'], ['us', 'American (NEASC / CIS)'], ['other', 'Other accredited']]),
        price('Annual fees', [[null, 40000], [40000, 70000], [70000, null]]),
        tog('transport', 'Transport'),
        sel('admissions', 'Admissions', [['open', 'Places available'], ['waitlist', 'Waitlist']])
      ],
      price: () => between(28000, 95000, 500), unit: () => '/year',
      title: (a, c) => `${c.name} · ${a.curriculum} curriculum`,
      meta: a => [['grad', a.year.join(', ')], ['check', a.admissions === 'open' ? 'Places available' : 'Waitlist'], ['car', a.transport ? 'Transport' : 'No transport']] },

    { id: 'higher', label: 'Higher education', h1: 'Universities & colleges', basis: 'AED / course, term or year', hero: 'img/uni1.jpg', img: ['img/uni1.jpg', 'img/office2.jpg'], n: 8, from: 1,
      action: 'Apply', flow: ['Application', 'Eligibility', 'Offer', 'Enrolment', 'Timetable', 'Assessment', 'Completion'], org: ['CAA-accredited institution'], names: ['University of Dubai', 'Heriot-Watt Dubai', 'Middlesex Dubai', 'American University in Dubai'],
      fields: ['qualification', 'institution', 'intake', 'mode'],
      defs: [
        sel('qualification', 'Qualification', [['foundation', 'Foundation'], ['bachelor', "Bachelor's"], ['master', "Master's"], ['exec', 'Executive / MBA']], { many: 1 }),
        sel('institution', 'Institution', [['university', 'University'], ['branch', 'International branch campus'], ['college', 'College']]),
        sel('intake', 'Intake', ['Sep 2026', 'Jan 2027', 'May 2027'], { many: 1 }),
        sel('mode', 'Study mode', [['full', 'Full-time'], ['part', 'Part-time'], ['online', 'Online']], { many: 1 }),
        sel('entry', 'Entry requirements', [['hs', 'High school diploma'], ['degree', "Bachelor's degree"], ['exp', 'Work experience']]),
        sel('duration', 'Duration', [['1', '1 year'], ['2', '2 years'], ['3', '3 years'], ['4', '4 years']]),
        sel('accreditation', 'Accreditation', [['caa', 'CAA (UAE MoE)'], ['khda', 'KHDA'], ['intl', 'International']], { many: 1 }),
        tog('scholarship', 'Scholarship', { p: .6 })
      ],
      price: () => between(38000, 110000, 500), unit: () => '/year',
      title: (a, c) => `${c.name} · ${a.qualification.map(q => ({ foundation: 'Foundation', bachelor: "Bachelor's", master: "Master's", exec: 'MBA' }[q]))[0]}`,
      meta: a => [['cal', a.intake[0]], ['clock', a.duration + ' yr' + (a.duration > 1 ? 's' : '')], ['check', a.scholarship ? 'Scholarships' : 'Full fee']] },

    { id: 'course', label: 'Course', h1: 'Courses', basis: 'AED / course', hero: 'img/office2.jpg', img: ['img/office2.jpg', 'img/school1.jpg', 'img/office3.jpg'], n: 9,
      action: 'Enrol', flow: ['Enrolment', 'Payment', 'Timetable', 'Attendance', 'Assessment', 'Certificate'], org: ['KHDA-approved centre'], names: ['Le Wagon', 'Berlitz', 'Eton Institute', 'Coding Minds'],
      fields: ['subject', 'level', 'start', 'mode'],
      defs: [
        sel('subject', 'Subject', ['Coding', 'UX Design', 'Data & AI', 'Arabic', 'English / IELTS', 'Business']),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        date('start', 'Start date'),
        sel('mode', 'Mode', [['in-person', 'In-person'], ['online', 'Online'], ['hybrid', 'Hybrid']], { many: 1 }),
        lte('duration', 'Duration', [['4', 'Up to 4 weeks'], ['8', 'Up to 8 weeks'], ['12', 'Up to 12 weeks']], () => pick([2, 4, 6, 8, 12, 24]), { field: 'weeks', fmt: v => v + ' weeks' }),
        sel('schedule', 'Schedule', [['weekday-am', 'Weekday mornings'], ['weekday-pm', 'Weekday evenings'], ['weekend', 'Weekends']], { many: 1 }),
        tog('certificate', 'Certificate', { p: .7 }),
        mul('language', 'Language', ['English', 'Arabic'], { gen: () => chance(.3) ? ['English', 'Arabic'] : ['English'] })
      ],
      price: a => between(80, 260, 10) * a.weeks, unit: () => '/course',
      title: (a, c) => `${a.subject} ${pick(['Bootcamp', 'Course', 'Programme'])} · ${c.name}`,
      meta: a => [['clock', a.weeks + ' weeks'], ['pin', a.mode.map(m => ({ 'in-person': 'In-person', online: 'Online', hybrid: 'Hybrid' }[m])).join(' / ')], ['check', a.certificate ? 'Certificate' : 'No certificate']] },

    { id: 'camp', label: 'Camp', h1: 'Kids camps', basis: 'AED / day or package', hero: 'img/school2.jpg', img: ['img/fit1.jpg', 'img/school2.jpg', 'img/workshop1.jpg'], n: 9, from: 1,
      action: 'Enrol', flow: ['Enrolment', 'Consent', 'Payment', 'Attendance', 'Completion'], org: ['KHDA-approved centre'], names: ['Camp Beaver', 'Kids Active', 'Sports Village', 'Young Engineers'],
      fields: ['activity', 'age', 'date', 'loc'],
      defs: [
        sel('activity', 'Activity', ['Sports', 'Arts & crafts', 'STEM & robotics', 'Multi-activity', 'Swimming']),
        sel('age', 'Age', [['4-7', '4–7 yrs'], ['8-12', '8–12 yrs'], ['13-16', '13–16 yrs']], { many: 1 }),
        date('date', 'Date'),
        sel('duration', 'Duration', [['day', 'Daily drop-in'], ['week', '1 week'], ['multi', '2+ weeks']], { many: 1 }),
        tog('meals', 'Meals'), tog('transport', 'Transport', { p: .4 }),
        lte('group', 'Group size', [['8', 'Up to 8'], ['12', 'Up to 12'], ['20', 'Up to 20']], () => pick([8, 10, 12, 16, 20, 25]), { field: 'groupMax', fmt: v => 'Max ' + v + ' kids' })
      ],
      price: () => between(140, 420, 10), unit: () => '/day',
      title: (a, c) => `${a.activity} Camp · ${c.name}`,
      meta: a => [['users', a.age.map(x => x.replace('-', '–')).join(', ') + ' yrs'], ['cal', a.duration.map(d => ({ day: 'Drop-in', week: '1 wk', multi: '2+ wks' }[d])).join(' / ')], ['users', 'Max ' + a.groupMax]] },

    { id: 'academy', label: 'Academy', h1: 'Sports academies', basis: 'AED / term', hero: 'img/padel2.jpg', img: ['img/padel1.jpg', 'img/fit2.jpg'], n: 9, from: 1,
      action: 'Apply', flow: ['Application', 'Assessment', 'Placement', 'Term', 'Progress'], org: ['Sports academy'], names: ['Elite Football Academy', 'Hamilton Aquatics', 'Tennis 360', 'Legacy BJJ'],
      fields: ['sport', 'age', 'level', 'term'],
      defs: [
        sel('sport', 'Sport', ['Football', 'Swimming', 'Tennis', 'Basketball', 'Martial arts', 'Gymnastics']),
        sel('age', 'Age', [['4-7', '4–7 yrs'], ['8-12', '8–12 yrs'], ['13-17', '13–17 yrs'], ['adult', 'Adults']], { many: 1 }),
        sel('level', 'Level', ['Beginner', 'Intermediate', 'Advanced'], { many: 1 }),
        sel('term', 'Term', ['Autumn 2026', 'Spring 2027', 'Summer 2027'], { many: 1 }),
        sel('schedule', 'Schedule', [['weekday-pm', 'Weekday evenings'], ['weekend', 'Weekends']], { many: 1 }),
        sel('area', 'Location', AREA_OPTS, { get: l => l.loc, nogen: 1 }),
        sel('coach', 'Coach', [['licensed', 'Licensed coaches'], ['pro', 'Ex-professional coaches']], { many: 1 }),
        tog('assessment', 'Assessment', { p: .6 })
      ],
      price: () => between(900, 4200, 50), unit: () => '/term',
      title: (a, c) => `${a.sport} · ${c.name}`,
      meta: a => [['users', a.age.map(x => x === 'adult' ? 'Adults' : x.replace('-', '–')).join(', ')], ['cal', a.schedule.map(s => s === 'weekend' ? 'Weekends' : 'Weekdays').join(' & ')], ['check', a.assessment ? 'Free assessment' : a.level.join(', ')]] }
  ] };

  V.health = { id: 'health', label: 'Health', icon: 'cross', blurb: 'Doctors, dentists, physio, diagnostics and care.', hero: 'img/doctor1.jpg', offers: [
    { id: 'doctor', label: 'Doctor consultation', h1: 'Doctors', basis: 'AED / consultation', hero: 'img/doctor1.jpg', img: ['img/doctor2.jpg', 'img/doctor1.jpg'], n: 10, from: 1,
      action: 'Book appointment', flow: ['Appointment', 'Patient intake & consent', 'Eligibility / payment', 'Encounter', 'Orders', 'Follow-up'], org: ['DHA-licensed clinic'], names: ['Dr. Sara Haddad', 'Dr. Omar Nasser', 'Dr. Priya Mehta', 'Mediclinic City', 'Health Bay Clinic'],
      fields: ['specialty', 'loc', 'date', 'appt'],
      defs: [
        sel('specialty', 'Specialty', ['Family medicine', 'Paediatrics', 'Dermatology', 'Gynaecology', 'Cardiology', 'ENT'], { many: 1, k: 3 }),
        date('date', 'Date'),
        sel('appt', 'Appointment', [['first', 'First visit'], ['followup', 'Follow-up'], ['urgent', 'Urgent · same day']], { many: 1 }),
        sel('practitioner', 'Practitioner', [['gp', 'GP'], ['specialist', 'Specialist'], ['consultant', 'Consultant']]),
        ins(), lang(),
        sel('setting', 'Clinic / home / online', [['clinic', 'Clinic'], ['home', 'Home visit'], ['online', 'Online video']], { many: 1 })
      ],
      price: a => between(150, 600, 10) * (a.practitioner === 'consultant' ? 1.4 : 1), unit: () => '/consultation',
      title: (a, c) => `${c.name} · ${a.specialty[0]}`,
      meta: (a, l) => [['shield', a.insurance.length + ' insurers'], ['pin', a.setting.map(x => ({ clinic: 'Clinic', home: 'Home', online: 'Online' }[x])).join(' / ')], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'dental', label: 'Dental', h1: 'Dentists', basis: 'AED / consultation or treatment', hero: 'img/dental1.jpg', img: ['img/dental1.jpg', 'img/dental2.jpg'], n: 9, from: 1,
      action: 'Book appointment', flow: ['Appointment', 'Medical history & consent', 'Examination / imaging', 'Treatment plan', 'Claim / payment', 'Recall'], org: ['DHA-licensed clinic'], names: ['Bright Smile Dental', 'Versailles Dental', 'Seven Dental', 'Smile Studio'],
      fields: ['treatment', 'loc', 'date', 'time'], locLabel: 'Area',
      defs: [
        sel('treatment', 'Treatment', ['Check-up & cleaning', 'Whitening', 'Aligners & braces', 'Implants', 'Root canal', 'Kids dentistry'], { many: 1, k: 4 }),
        date('date', 'Date'), sel('time', 'Time', TIME, { many: 1, field: 'slots' }),
        sel('clinic', 'Clinic', [['specialist', 'Specialist centre'], ['family', 'Family clinic'], ['hospital', 'Hospital department']]),
        ins(), lang(),
        sel('specialist', 'Specialist', ['Orthodontist', 'Endodontist', 'Periodontist', 'Paediatric dentist'], { many: 1 })
      ],
      price: () => between(150, 450, 10), unit: () => '/consultation',
      title: (a, c) => `${c.name} · ${a.specialist[0]}`,
      meta: (a, l) => [['shield', a.insurance.length + ' insurers'], ['users', a.language.slice(0, 2).join(', ')], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'physio', label: 'Physiotherapy', h1: 'Physiotherapy', basis: 'AED / session or package', hero: 'img/physio1.jpg', img: ['img/physio1.jpg', 'img/fit1.jpg'], n: 8, from: 1,
      action: 'Book assessment', flow: ['Assessment', 'Treatment plan', 'Authorization / payment', 'Sessions', 'Progress', 'Discharge'], org: ['DHA-licensed clinic'], names: ['PhysioWorks', 'Body Motion', 'Back in Motion', 'Sport Rehab DXB'],
      fields: ['condition', 'loc', 'practitioner', 'start'],
      defs: [
        sel('condition', 'Condition', ['Back & neck pain', 'Sports injury', 'Post-surgery rehab', 'Pre/post-natal', 'Posture'], { many: 1, k: 3 }),
        sel('practitioner', 'Practitioner', [['physio', 'Physiotherapist'], ['senior', 'Senior physiotherapist'], ['chiro', 'Chiropractor']]),
        date('start', 'Start date'),
        sel('setting', 'Clinic / home', [['clinic', 'In clinic'], ['home', 'Home visit']], { many: 1 }),
        ins(),
        sel('session', 'Session duration', [['30', '30 min'], ['45', '45 min'], ['60', '60 min']], { many: 1 }),
        sel('specialty', 'Specialty', ['Sports', 'Orthopaedic', 'Neurological', "Women's health"], { many: 1 })
      ],
      price: () => between(220, 550, 10), unit: () => '/session',
      title: (a, c) => `${a.condition[0]} · ${c.name}`,
      meta: (a, l) => [['pin', a.setting.includes('home') ? 'Home visits' : 'In clinic'], ['clock', a.session.map(x => x + ' min').join(' / ')], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'diagnostics', label: 'Diagnostics', h1: 'Lab tests & diagnostics', basis: 'AED / test or package', hero: 'img/lab1.jpg', img: ['img/lab1.jpg', 'img/doctor2.jpg'], n: 8, from: 1,
      action: 'Book test', flow: ['Order', 'Eligibility / payment', 'Collection', 'Result', 'Practitioner review'], org: ['DHA-licensed lab'], names: ['Unilabs', 'Medsol Diagnostics', 'Thumbay Labs', 'Al Borg Diagnostics'],
      fields: ['test', 'loc', 'date', 'referral'],
      defs: [
        sel('test', 'Test', ['Full body check-up', 'Blood panel', 'Vitamin & hormones', 'MRI / CT scan', 'X-ray & ultrasound'], { many: 1, k: 3 }),
        date('date', 'Date'),
        sel('referral', 'Referral', [['none', 'No referral needed'], ['have', 'I have a referral']], { many: 1 }),
        tog('home', 'Home collection', { p: .5 }),
        ins(),
        lte('results', 'Result time', [['24', 'Within 24 hrs'], ['48', 'Within 48 hrs'], ['72', 'Within 72 hrs']], () => pick([6, 24, 24, 48, 72]), { fmt: v => v + ' hrs' }),
        sel('lab', 'Laboratory', [['hospital', 'Hospital lab'], ['independent', 'Independent lab'], ['imaging', 'Imaging centre']])
      ],
      price: a => a.test.includes('MRI / CT scan') ? between(900, 2200, 50) : between(120, 900, 10), unit: () => '/test',
      title: (a, c) => `${a.test[0]} · ${c.name}`,
      meta: a => [['clock', 'Results in ' + a.results + 'h'], ['pin', a.home ? 'Home collection' : 'At lab'], ['shield', a.insurance.length + ' insurers']] },

    { id: 'mental', label: 'Mental health', h1: 'Therapists & counsellors', basis: 'AED / session', hero: 'img/therapy1.jpg', img: ['img/therapy1.jpg'], n: 8, from: 1,
      action: 'Book session', flow: ['Appointment', 'Consent', 'Assessment', 'Care plan', 'Sessions', 'Follow-up'], org: ['DHA-licensed practice'], names: ['LightHouse Arabia', 'The Hundred Wellness', 'Thrive Wellbeing', 'Mind Space'],
      fields: ['care', 'loc', 'date', 'language'], locLabel: 'Location / online',
      defs: [
        sel('care', 'Care type', ['Anxiety & stress', 'Depression', 'Relationships', 'Child & teen', 'Burnout'], { many: 1, k: 3 }),
        date('date', 'Date'), lang(),
        sel('practitioner', 'Practitioner', [['psychologist', 'Psychologist'], ['psychiatrist', 'Psychiatrist'], ['counsellor', 'Counsellor']]),
        ins(),
        sel('sessionType', 'Session type', [['individual', 'Individual'], ['couples', 'Couples'], ['family', 'Family'], ['group', 'Group']], { many: 1 }),
        sel('confidentiality', 'Confidentiality', [['standard', 'Standard'], ['enhanced', 'Enhanced · no insurance record']])
      ],
      price: a => between(400, 900, 10) * (a.practitioner === 'psychiatrist' ? 1.4 : 1), unit: () => '/session',
      title: (a, c) => `${L(c.def('practitioner'), a.practitioner)} · ${c.name}`,
      meta: (a, l) => [['users', a.language.slice(0, 2).join(', ')], ['check', a.sessionType.map(x => x[0].toUpperCase() + x.slice(1)).join(', ')], ['star', l.rating + ' (' + l.reviews + ')']] },

    { id: 'homecare', label: 'Home healthcare', h1: 'Home healthcare', basis: 'AED / visit or care plan', hero: 'img/homecare1.jpg', img: ['img/homecare1.jpg'], n: 8, from: 1, coverage: 1,
      action: 'Request care', flow: ['Request', 'Clinical assessment', 'Authorization / payment', 'Care visits', 'Evidence', 'Review'], org: ['DHA-licensed provider'], names: ['Manzil Healthcare', 'Emirates Home Nursing', 'Amana Home Care', 'Call a Doctor'],
      fields: ['care', 'loc', 'start', 'frequency'],
      defs: [
        sel('care', 'Care needed', ['Nursing visit', 'Elderly care', 'Post-op care', 'IV & injections', 'Doctor on call'], { many: 1, k: 3 }),
        date('start', 'Start date'),
        sel('frequency', 'Frequency', [['once', 'One-time visit'], ['daily', 'Daily'], ['live-in', 'Live-in']], { many: 1 }),
        sel('carer', 'Nursing / doctor / therapy', [['nursing', 'Nursing'], ['doctor', 'Doctor'], ['therapy', 'Therapy']], { many: 1 }),
        ins(),
        sel('duration', 'Duration', [['1', '1 hr'], ['4', '4 hrs'], ['12', '12 hrs'], ['24', '24 hrs']], { many: 1 }),
        tog('licensed', 'Licensed provider', { p: .9 })
      ],
      price: () => between(180, 750, 10), unit: () => '/visit',
      title: (a, c) => `${a.care[0]} · ${c.name}`,
      meta: a => [['users', a.carer.map(x => x[0].toUpperCase() + x.slice(1)).join(' / ')], ['clock', a.frequency.map(f => ({ once: 'One-time', daily: 'Daily', 'live-in': 'Live-in' }[f])).join(' / ')], ['shield', a.licensed ? 'DHA-licensed' : 'Registered']] }
  ] };

  V.insurance = { id: 'insurance', label: 'Protection', icon: 'umbrella', blurb: 'Motor, health and property cover.', hero: 'img/family1.jpg', offers: [
    { id: 'motor', label: 'Motor', h1: 'Motor insurance', basis: 'Quoted annual premium', hero: 'img/car2.jpg', img: [], tile: 1, n: 8, from: 1, locAll: 1,
      action: 'Get quote', flow: ['Quote request', 'Eligibility', 'Comparison', 'Application', 'Policy'], org: ['CBUAE-licensed insurer'], names: ['AXA Gulf', 'Tokio Marine', 'RSA', 'Orient', 'Sukoon'],
      fields: ['vehicle', 'regYear', 'driverAge', 'coverage'],
      defs: [
        sel('vehicle', 'Vehicle', ['Sedan', 'SUV', 'Sports car', 'Luxury', 'Electric'], { many: 1, k: 4 }),
        sel('regYear', 'Registration year', [['2024', '2024 or newer'], ['2020', '2020–2023'], ['older', 'Before 2020']], { many: 1 }),
        sel('driverAge', 'Driver age', [['18', '18–24'], ['25', '25–39'], ['40', '40–59'], ['60', '60+']], { many: 1, k: 4 }),
        sel('coverage', 'Coverage', [['comprehensive', 'Comprehensive'], ['tpl', 'Third-party only']]),
        tog('comprehensive', 'Comprehensive', { get: l => l.a.coverage === 'comprehensive', nogen: 1 }),
        tog('agency', 'Agency repair'), tog('roadside', 'Roadside', { p: .7 }),
        lte('deductible', 'Deductible', [['250', 'AED 250 or less'], ['500', 'AED 500 or less'], ['1000', 'AED 1,000 or less']], () => pick([0, 250, 350, 500, 1000]), { fmt: v => 'AED ' + v })
      ],
      price: a => a.coverage === 'tpl' ? between(650, 1200, 10) : between(1400, 4800, 50), unit: () => '/year',
      title: (a, c) => `${c.name} ${a.coverage === 'tpl' ? 'Third-Party' : 'Comprehensive'} ${a.agency ? '+ Agency Repair' : 'Cover'}`,
      meta: a => [['shield', a.coverage === 'tpl' ? 'Third-party' : 'Comprehensive'], ['tool', a.agency ? 'Agency repair' : 'Garage repair'], ['tag', 'AED ' + a.deductible + ' excess']] },

    { id: 'health', label: 'Health', h1: 'Health insurance', basis: 'Quoted annual premium', hero: 'img/family1.jpg', img: [], tile: 1, n: 8, from: 1, locAll: 1,
      action: 'Get quote', flow: ['Quote request', 'Health details', 'Comparison', 'Application', 'Policy'], org: ['CBUAE-licensed insurer'], names: ['Daman', 'Bupa Global', 'Cigna', 'MetLife', 'Allianz Care'],
      fields: ['customer', 'ageBand', 'area', 'network'],
      defs: [
        sel('customer', 'Customer type', [['individual', 'Individual'], ['family', 'Family'], ['sme', 'Employer / SME'], ['domestic', 'Domestic worker']], { many: 1, k: 3 }),
        sel('ageBand', 'Age band', [['18', '18–30'], ['31', '31–45'], ['46', '46–60'], ['61', '60+']], { many: 1, k: 4 }),
        sel('area', 'Coverage area', [['uae', 'UAE only'], ['ww-us', 'Worldwide excl. US'], ['ww', 'Worldwide']]),
        sel('network', 'Network', [['basic', 'Basic'], ['enhanced', 'Enhanced'], ['premium', 'Premium']]),
        tog('outpatient', 'Outpatient', { p: .8 }), tog('dental', 'Dental'), tog('maternity', 'Maternity'),
        lte('deductible', 'Deductible', [['0', 'No co-pay'], ['10', 'Up to 10%'], ['20', 'Up to 20%']], () => pick([0, 10, 20]), { fmt: v => v + '% co-pay' })
      ],
      price: a => between(900, 3000, 50) * ({ basic: 1, enhanced: 2.2, premium: 4 }[a.network]) * (a.area === 'ww' ? 1.8 : 1), unit: () => '/year',
      title: (a, c) => `${c.name} ${L(c.def('network'), a.network)} · ${L(c.def('area'), a.area)}`,
      meta: a => [['shield', { basic: 'Basic', enhanced: 'Enhanced', premium: 'Premium' }[a.network] + ' network'], ['check', [a.outpatient && 'OP', a.dental && 'Dental', a.maternity && 'Maternity'].filter(Boolean).join(' · ') || 'Inpatient'], ['tag', a.deductible + '% co-pay']] },

    { id: 'property', label: 'Property', h1: 'Property insurance', basis: 'Quoted annual premium', hero: 'img/villa3.jpg', img: [], tile: 1, n: 7, from: 1,
      action: 'Get quote', flow: ['Quote request', 'Risk details', 'Comparison', 'Application', 'Policy'], org: ['CBUAE-licensed insurer'], names: ['Sukoon', 'RSA', 'AXA Gulf', 'Zurich', 'Salama'],
      fields: ['ptype', 'loc', 'value', 'occupancy'],
      defs: [
        sel('ptype', 'Property type', ['Apartment', 'Villa', 'Office', 'Warehouse'], { many: 1, k: 3 }),
        gte('value', 'Value', [['1', 'Up to AED 1M'], ['3', 'AED 1M–3M'], ['10', 'AED 3M+']], () => pick([2, 5, 10, 25]), { field: 'maxValue', fmt: v => 'Up to AED ' + v + 'M' }),
        sel('occupancy', 'Occupancy', [['owner', 'Owner-occupier'], ['tenant', 'Tenant'], ['landlord', 'Landlord']], { many: 1 }),
        tog('building', 'Building cover'), tog('contents', 'Contents', { p: .8 }), tog('liability', 'Liability', { p: .7 }),
        lte('deductible', 'Deductible', [['500', 'AED 500 or less'], ['1000', 'AED 1,000 or less']], () => pick([250, 500, 1000, 2500]), { fmt: v => 'AED ' + v })
      ],
      price: () => between(350, 3200, 25), unit: () => '/year',
      title: (a, c) => `${c.name} ${a.occupancy.includes('tenant') ? 'Home Contents' : 'Home & Building'} Cover`,
      meta: a => [['home', a.ptype.join(', ')], ['check', [a.building && 'Building', a.contents && 'Contents', a.liability && 'Liability'].filter(Boolean).join(' · ') || 'Basic'], ['tag', 'AED ' + a.deductible + ' excess']] }
  ] };

  const VORDER = ['spaces', 'services', 'experiences', 'memberships', 'programs', 'health', 'insurance'];

  /* ---------- generate listings ---------- */
  const LISTINGS = [];
  VORDER.forEach(vid => V[vid].offers.forEach(off => {
    off.v = vid;
    const defMap = Object.fromEntries(off.defs.map(d => [d.id, d]));
    for (let i = 0; i < off.n; i++) {
      const a = {};
      off.defs.forEach(d => {
        const key = d.field || d.id;
        if (d.nogen || d.type === 'range' || a[key] !== undefined) return;
        if (d.gen) { a[key] = d.gen(a); return; }
        if (d.type === 'select' || d.type === 'seg') a[key] = d.many ? pickN(d.options, between(1, Math.min(d.k || 3, d.options.length))).map(x => x.v) : pick(d.options).v;
        else if (d.type === 'multi') a[key] = pickN(d.options, between(1, Math.min(d.k || 3, d.options.length))).map(x => x.v);
        else if (d.type === 'toggle') a[key] = chance(d.p != null ? d.p : .55);
        else if (d.type === 'date') a[key] = pick([0, 0, 1, 1, 2, 3, 5, 10]);
      });
      a.verified = chance(.86);
      if (off.post) off.post(a);
      const loc = off.locs ? pick(off.locs) : pick(AREAS).id;
      const name = off.names ? pick(off.names) : null;
      const ctx = { def: id => defMap[id], areaN: areaName(loc), name };
      const bld = off.id === 'live' ? pick(BLD[loc]) : null;
      const pr = off.price ? off.price(a) : 100;
      const person = off.people ? pick(PEOPLE) : name || pick(PEOPLE);
      LISTINGS.push({
        v: vid, cat: off.id, loc, building: bld, a, title: off.title(a, ctx), price: Math.round(pr / (pr > 5000 ? 500 : pr > 1000 ? 50 : 5)) * (pr > 5000 ? 500 : pr > 1000 ? 50 : 5),
        img: off.img.length ? [...off.img.slice(i % off.img.length), ...off.img.slice(0, i % off.img.length)] : [],
        coverage: off.coverage ? [loc, ...pickN(AREAS.filter(x => x.id !== loc), between(4, 10)).map(x => x.id)] : null,
        rating: +(4 + rnd() * .95).toFixed(1), reviews: between(6, 900), posted: between(0, 40),
        provider: { name: person, org: off.people ? pick(off.org) : off.org[0], phone: phone(), reply: pick([5, 10, 15, 30, 60]) },
        ref: 'UN-' + between(100000, 999999), permit: off.id === 'live' ? '71' + between(10000000, 99999999) : null
      });
    }
  }));
  LISTINGS.forEach((l, i) => { l.id = 'L' + (1000 + i); l.featured = rnd() < .16; });

  const offerOf = (v, c) => (V[v].offers.find(x => x.id === c) || V[v].offers[0]);
  window.UP = { AREAS, areaById, areaName, LISTINGS, VERTICALS: V, VORDER, offerOf, K: n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'K' : String(n) };
})();
