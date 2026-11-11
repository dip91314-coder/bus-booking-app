// Pan-India Bus Booking Platform - Mock Data

export const POPULAR_CITIES = [
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, terminals: ['Esplanade Bus Terminus', 'Karunamoyee Bus Station', 'Babughat'] },
  { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953, terminals: ['Tenzing Norgay Bus Terminus', 'Siliguri Junction', 'Sevoke Road'] },
  { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, terminals: ['Kashmere Gate ISBT', 'Anand Vihar ISBT', 'Sarai Kale Khan ISBT'] },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, terminals: ['Sindhi Camp Bus Station', 'Narayan Singh Circle', '200 Ft Bypass'] },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, terminals: ['Borivali Nancy Colony', 'Dadar East TT Circle', 'Vashi Toll Plaza'] },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, terminals: ['Shivajinagar Bus Stand', 'Swargate Bus Station', 'Wakad Hinjewadi Bridge'] },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, terminals: ['Kempegowda Bus Station (Majestic)', 'Madiwala', 'Shantinagar Bus Station'] },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, terminals: ['Koyambedu CMBT', 'Kilambakkam KCBT', 'Guindy Kathipara'] },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, terminals: ['MGBS Bus Station', 'JBS Secunderabad', 'Ameerpet Metro Station'] },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, terminals: ['Geeta Mandir Bus Stand', 'Paldi Cross Road', 'C.G. Road'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, terminals: ['Alambagh Bus Stand', 'Charbagh Railway Station', 'Kamta Chauraha'] },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, terminals: ['Cantt Bus Station', 'Chauka Ghat', 'Lanka BHU'] },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, terminals: ['Bairiya ISBT', 'Mithapur Bus Stand', 'Gandhi Maidan'] },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, terminals: ['ISBT Betkuchi', 'Paltan Bazaar', 'Khanapara'] },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, terminals: ['Baramunda ISBT', 'Kalpana Square', 'Master Canteen'] },
  { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lng: 77.1892, terminals: ['Private Bus Stand Manali', 'Mall Road Barrier', 'Patlikuhl'] },
  { name: 'Goa (Panaji)', state: 'Goa', lat: 15.4909, lng: 73.8278, terminals: ['Panaji KTC Bus Stand', 'Mapusa Bus Stand', 'Margao KTC'] },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933, terminals: ['Police Bazar Stand', 'Anjali Point', 'Dhankheti'] },
];

export const BUS_OPERATORS = [
  'Greenline Express',
  'Royal Cruiser',
  'VRL Travels',
  'Zingbus Intercity',
  'SRS Travels',
  'Orange Tours & Travels',
  'IntrCity SmartBus',
  'Shyamoli Paribahan',
  'Himalayan Golden Bus',
  'KSRTC FlyBus'
];

export const MOCK_BUSES = [
  {
    id: 'BUS-101',
    busNumber: 'WB-04-E-5678',
    busName: 'Greenline Platinum Express',
    operator: 'Greenline Express',
    busType: 'AC Sleeper (2+1)',
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '20:00',
    arrivalTime: '06:30',
    journeyDuration: '10h 30m',
    fare: 1150,
    rating: 4.8,
    reviewsCount: 342,
    totalSeats: 36,
    availableSeatsCount: 14,
    hasLiveTracking: true,
    deckType: 'double', // has lower and upper deck
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light', 'Emergency Exit', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-1', name: 'Esplanade Bus Terminus (Platform 4)', time: '20:00', landmark: 'Opposite Metro Cinema' },
      { id: 'bp-2', name: 'Karunamoyee Salt Lake', time: '20:45', landmark: 'Bus Bay 2' },
      { id: 'bp-3', name: 'Airport Gate No. 1', time: '21:15', landmark: 'Jessore Road Flyover End' }
    ],
    droppingPoints: [
      { id: 'dp-1', name: 'Tenzing Norgay Bus Stand Siliguri', time: '06:00', landmark: 'Main Gate' },
      { id: 'dp-2', name: 'Siliguri Junction', time: '06:30', landmark: 'Near Railway Overbridge' }
    ],
    cancellationPolicy: 'Free cancellation up to 6 hours before departure. 50% refund within 2-6 hours.',
    seats: {
      lower: [
        { number: 'L1', type: 'single', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L2', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L3', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L4', type: 'single', deck: 'lower', price: 1150, status: 'available', isLadies: true },
        { number: 'L5', type: 'double', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L6', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L7', type: 'single', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L8', type: 'double', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L9', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L10', type: 'single', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L11', type: 'double', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L12', type: 'double', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L13', type: 'single', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L14', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L15', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
        { number: 'L16', type: 'single', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L17', type: 'double', deck: 'lower', price: 1150, status: 'available', isLadies: false },
        { number: 'L18', type: 'double', deck: 'lower', price: 1150, status: 'booked', isLadies: false },
      ],
      upper: [
        { number: 'U1', type: 'single', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U2', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U3', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U4', type: 'single', deck: 'upper', price: 1250, status: 'available', isLadies: true },
        { number: 'U5', type: 'double', deck: 'upper', price: 1250, status: 'available', isLadies: true },
        { number: 'U6', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U7', type: 'single', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U8', type: 'double', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U9', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U10', type: 'single', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U11', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U12', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U13', type: 'single', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U14', type: 'double', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U15', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U16', type: 'single', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
        { number: 'U17', type: 'double', deck: 'upper', price: 1250, status: 'available', isLadies: false },
        { number: 'U18', type: 'double', deck: 'upper', price: 1250, status: 'booked', isLadies: false },
      ]
    }
  },
  {
    id: 'BUS-102',
    busNumber: 'WB-02-B-9911',
    busName: 'Royal Cruiser Volvo B11R',
    operator: 'Royal Cruiser',
    busType: 'Multi-Axle AC Seater (2+2)',
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '21:30',
    arrivalTime: '08:00',
    journeyDuration: '10h 30m',
    fare: 890,
    rating: 4.6,
    reviewsCount: 289,
    totalSeats: 40,
    availableSeatsCount: 19,
    hasLiveTracking: true,
    deckType: 'single',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-101', name: 'Babughat Bus Stand', time: '21:30', landmark: 'Eden Gardens Gate 3' },
      { id: 'bp-102', name: 'Karunamoyee Salt Lake', time: '22:15', landmark: 'Near Central Park' }
    ],
    droppingPoints: [
      { id: 'dp-101', name: 'Siliguri Tenzing Norgay Stand', time: '08:00', landmark: 'Platform 1' }
    ],
    cancellationPolicy: 'Cancellation allowed up to 4 hours before journey.',
    seats: {
      lower: Array.from({ length: 40 }, (_, i) => {
        const row = String.fromCharCode(65 + Math.floor(i / 4));
        const num = (i % 4) + 1;
        const seatNo = `${row}${num}`;
        const isBooked = [0, 1, 4, 7, 12, 13, 20, 21, 24, 25, 30, 31].includes(i);
        const isLadies = [2, 3, 6].includes(i);
        return {
          number: seatNo,
          type: 'seater',
          deck: 'lower',
          price: 890,
          status: isBooked ? 'booked' : 'available',
          isLadies
        };
      })
    }
  },
  {
    id: 'BUS-103',
    busNumber: 'DL-01-TC-4400',
    busName: 'Zingbus Maxx AC Sleeper',
    operator: 'Zingbus Intercity',
    busType: 'AC Sleeper (2+1)',
    origin: 'Delhi',
    destination: 'Jaipur',
    departureTime: '06:30',
    arrivalTime: '11:45',
    journeyDuration: '5h 15m',
    fare: 650,
    rating: 4.9,
    reviewsCount: 512,
    totalSeats: 36,
    availableSeatsCount: 22,
    hasLiveTracking: true,
    deckType: 'double',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Snacks', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-201', name: 'Kashmere Gate Metro Gate 1', time: '06:30', landmark: 'Opposite Metro Station' },
      { id: 'bp-202', name: 'Dhaula Kuan Metro Station', time: '07:15', landmark: 'Foot Over Bridge' },
      { id: 'bp-203', name: 'IFFCO Chowk Gurgaon', time: '07:50', landmark: 'Flyover Pillar 45' }
    ],
    droppingPoints: [
      { id: 'dp-201', name: 'Sindhi Camp Bus Stand Jaipur', time: '11:30', landmark: 'Metro Pillar 12' },
      { id: 'dp-202', name: 'Narayan Singh Circle', time: '11:45', landmark: 'Near City Hospital' }
    ],
    cancellationPolicy: '100% refund up to 12 hours before scheduled departure.',
    seats: {
      lower: Array.from({ length: 18 }, (_, i) => ({
        number: `L${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'lower',
        price: 650,
        status: [1, 5, 8, 11].includes(i) ? 'booked' : 'available',
        isLadies: [0, 3].includes(i)
      })),
      upper: Array.from({ length: 18 }, (_, i) => ({
        number: `U${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'upper',
        price: 720,
        status: [2, 6, 9].includes(i) ? 'booked' : 'available',
        isLadies: [1].includes(i)
      }))
    }
  },
  {
    id: 'BUS-104',
    busNumber: 'MH-12-RN-7788',
    busName: 'VRL I-Shift Volvo Multi-Axle',
    operator: 'VRL Travels',
    busType: 'AC Sleeper (2+1)',
    origin: 'Mumbai',
    destination: 'Pune',
    departureTime: '07:00',
    arrivalTime: '10:30',
    journeyDuration: '3h 30m',
    fare: 450,
    rating: 4.7,
    reviewsCount: 420,
    totalSeats: 36,
    availableSeatsCount: 16,
    hasLiveTracking: true,
    deckType: 'double',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-301', name: 'Borivali (W) Gokul Hotel', time: '07:00', landmark: 'SV Road' },
      { id: 'bp-302', name: 'Dadar (E) Swami Narayan Temple', time: '07:45', landmark: 'Near Railway Station' },
      { id: 'bp-303', name: 'Vashi Toll Plaza', time: '08:25', landmark: 'Highway Bridge' }
    ],
    droppingPoints: [
      { id: 'dp-301', name: 'Wakad Hinjewadi Flyover', time: '10:00', landmark: 'Ginger Hotel' },
      { id: 'dp-302', name: 'Swargate Bus Station', time: '10:30', landmark: 'Platform 3' }
    ],
    cancellationPolicy: 'Cancellations allowed up to 2 hours before departure.',
    seats: {
      lower: Array.from({ length: 18 }, (_, i) => ({
        number: `L${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'lower',
        price: 450,
        status: [0, 2, 4, 7, 10, 13].includes(i) ? 'booked' : 'available',
        isLadies: [1, 2].includes(i)
      })),
      upper: Array.from({ length: 18 }, (_, i) => ({
        number: `U${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'upper',
        price: 520,
        status: [1, 3, 8, 12].includes(i) ? 'booked' : 'available',
        isLadies: [0].includes(i)
      }))
    }
  },
  {
    id: 'BUS-105',
    busNumber: 'KA-01-F-1100',
    busName: 'SRS Diamond Class Multi-Axle',
    operator: 'SRS Travels',
    busType: 'AC Sleeper (2+1)',
    origin: 'Bengaluru',
    destination: 'Chennai',
    departureTime: '23:00',
    arrivalTime: '05:30',
    journeyDuration: '6h 30m',
    fare: 799,
    rating: 4.5,
    reviewsCount: 310,
    totalSeats: 36,
    availableSeatsCount: 15,
    hasLiveTracking: true,
    deckType: 'double',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-401', name: 'Kempegowda Bus Station (Majestic)', time: '23:00', landmark: 'Platform 18' },
      { id: 'bp-402', name: 'Madiwala St. John Hospital', time: '23:45', landmark: 'Opposite Petrol Pump' },
      { id: 'bp-403', name: 'Electronic City Toll Plaza', time: '00:15', landmark: 'Phase 1 Elevated Expressway' }
    ],
    droppingPoints: [
      { id: 'dp-401', name: 'Koyambedu CMBT Chennai', time: '05:15', landmark: 'Omni Bus Stand' },
      { id: 'dp-402', name: 'Guindy Kathipara Junction', time: '05:30', landmark: 'Near Metro Station' }
    ],
    cancellationPolicy: 'Refund of 80% if cancelled 8 hours prior.',
    seats: {
      lower: Array.from({ length: 18 }, (_, i) => ({
        number: `L${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'lower',
        price: 799,
        status: [1, 3, 5, 8, 12].includes(i) ? 'booked' : 'available',
        isLadies: [2, 3].includes(i)
      })),
      upper: Array.from({ length: 18 }, (_, i) => ({
        number: `U${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'upper',
        price: 899,
        status: [0, 4, 7, 10, 14].includes(i) ? 'booked' : 'available',
        isLadies: [0].includes(i)
      }))
    }
  },
  {
    id: 'BUS-106',
    busNumber: 'HP-01-A-7007',
    busName: 'Himalayan Golden Volvo B9R',
    operator: 'Himalayan Golden Bus',
    busType: 'AC Seater Semi-Sleeper (2+2)',
    origin: 'Delhi',
    destination: 'Manali',
    departureTime: '18:30',
    arrivalTime: '08:30',
    journeyDuration: '14h 00m',
    fare: 1450,
    rating: 4.9,
    reviewsCount: 680,
    totalSeats: 40,
    availableSeatsCount: 11,
    hasLiveTracking: true,
    deckType: 'single',
    amenities: ['AC', 'Heater', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-501', name: 'Majnu Ka Tilla Gurudwara', time: '18:30', landmark: 'Near Tibetan Market' },
      { id: 'bp-502', name: 'Kashmere Gate ISBT', time: '19:15', landmark: 'Gate 2' }
    ],
    droppingPoints: [
      { id: 'dp-501', name: 'Private Bus Stand Manali', time: '08:00', landmark: 'Mall Road Entrance' },
      { id: 'dp-502', name: 'Patlikuhl Bridge', time: '08:30', landmark: 'NH-3' }
    ],
    cancellationPolicy: 'Cancellation within 12h: 50% refund. >24h: 90% refund.',
    seats: {
      lower: Array.from({ length: 40 }, (_, i) => {
        const row = String.fromCharCode(65 + Math.floor(i / 4));
        const num = (i % 4) + 1;
        return {
          number: `${row}${num}`,
          type: 'semi-sleeper',
          deck: 'lower',
          price: 1450,
          status: [0, 1, 2, 3, 5, 6, 8, 9, 12, 13, 16, 17, 20, 21, 24, 25, 28, 29, 32].includes(i) ? 'booked' : 'available',
          isLadies: [4, 7, 10].includes(i)
        };
      })
    }
  },
  {
    id: 'BUS-107',
    busNumber: 'TS-09-UB-3344',
    busName: 'Orange Sleeper Gold Edition',
    operator: 'Orange Tours & Travels',
    busType: 'AC Sleeper (2+1)',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    departureTime: '21:45',
    arrivalTime: '06:15',
    journeyDuration: '8h 30m',
    fare: 1250,
    rating: 4.8,
    reviewsCount: 389,
    totalSeats: 36,
    availableSeatsCount: 18,
    hasLiveTracking: true,
    deckType: 'double',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-601', name: 'MGBS Bus Station (Gate 1)', time: '21:45', landmark: 'Near Booking Counter' },
      { id: 'bp-602', name: 'Ameerpet Metro Pillar 1042', time: '22:15', landmark: 'Main Highway' },
      { id: 'bp-603', name: 'Gachibowli ORR Junction', time: '22:50', landmark: 'Near Outer Ring Road' }
    ],
    droppingPoints: [
      { id: 'dp-601', name: 'Hebbal Flyover', time: '05:45', landmark: 'Esteem Mall' },
      { id: 'dp-602', name: 'Majestic Bus Stand', time: '06:15', landmark: 'Opposite Railway Station' }
    ],
    cancellationPolicy: 'Instant refund available up to 4h before departure.',
    seats: {
      lower: Array.from({ length: 18 }, (_, i) => ({
        number: `L${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'lower',
        price: 1250,
        status: [0, 3, 7, 11].includes(i) ? 'booked' : 'available',
        isLadies: [1].includes(i)
      })),
      upper: Array.from({ length: 18 }, (_, i) => ({
        number: `U${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'upper',
        price: 1350,
        status: [2, 5, 8, 14].includes(i) ? 'booked' : 'available',
        isLadies: [2].includes(i)
      }))
    }
  },
  {
    id: 'BUS-108',
    busNumber: 'UP-65-AX-1020',
    busName: 'IntrCity SmartBus Kashi Yatra',
    operator: 'IntrCity SmartBus',
    busType: 'AC Sleeper (2+1)',
    origin: 'Kolkata',
    destination: 'Varanasi',
    departureTime: '17:00',
    arrivalTime: '06:00',
    journeyDuration: '13h 00m',
    fare: 1380,
    rating: 4.7,
    reviewsCount: 275,
    totalSeats: 36,
    availableSeatsCount: 20,
    hasLiveTracking: true,
    deckType: 'double',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light', 'Live GPS'],
    boardingPoints: [
      { id: 'bp-701', name: 'Babughat Stand Kolkata', time: '17:00', landmark: 'Eden Garden Gate' },
      { id: 'bp-702', name: 'Dankuni Toll Plaza', time: '18:00', landmark: 'NH-19 Junction' }
    ],
    droppingPoints: [
      { id: 'dp-701', name: 'Cantt Bus Station Varanasi', time: '05:30', landmark: 'Railway Station Road' },
      { id: 'dp-702', name: 'Lanka BHU Gate', time: '06:00', landmark: 'Main Gate' }
    ],
    cancellationPolicy: 'Full refund 12 hours prior to scheduled departure.',
    seats: {
      lower: Array.from({ length: 18 }, (_, i) => ({
        number: `L${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'lower',
        price: 1380,
        status: [1, 4, 9].includes(i) ? 'booked' : 'available',
        isLadies: [0].includes(i)
      })),
      upper: Array.from({ length: 18 }, (_, i) => ({
        number: `U${i + 1}`,
        type: i % 3 === 0 ? 'single' : 'double',
        deck: 'upper',
        price: 1480,
        status: [2, 6, 13].includes(i) ? 'booked' : 'available',
        isLadies: [1].includes(i)
      }))
    }
  }
];

export const POPULAR_ROUTES = [
  { origin: 'Kolkata', destination: 'Siliguri', distance: '560 km', duration: '10h 30m', fare: '₹890 onwards', busesCount: 14, tag: 'Bestseller' },
  { origin: 'Delhi', destination: 'Jaipur', distance: '280 km', duration: '5h 15m', fare: '₹450 onwards', busesCount: 38, tag: 'High Frequency' },
  { origin: 'Mumbai', destination: 'Pune', distance: '150 km', duration: '3h 30m', fare: '₹350 onwards', busesCount: 52, tag: 'Express Highway' },
  { origin: 'Bengaluru', destination: 'Chennai', distance: '345 km', duration: '6h 30m', fare: '₹550 onwards', busesCount: 26, tag: 'Popular' },
  { origin: 'Delhi', destination: 'Manali', distance: '535 km', duration: '14h 00m', fare: '₹1,250 onwards', busesCount: 18, tag: 'Scenic Hills' },
  { origin: 'Hyderabad', destination: 'Bengaluru', distance: '570 km', duration: '8h 30m', fare: '₹950 onwards', busesCount: 22, tag: 'Overnight' },
  { origin: 'Kolkata', destination: 'Varanasi', distance: '680 km', duration: '13h 00m', fare: '₹1,150 onwards', busesCount: 10, tag: 'Heritage' },
  { origin: 'Pune', destination: 'Goa (Panaji)', distance: '445 km', duration: '9h 45m', fare: '₹850 onwards', busesCount: 16, tag: 'Vacation' },
];

export const FEATURED_DESTINATIONS = [
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    title: 'The Spiritual Capital',
    description: 'Ancient ghats, Ganga Aarti, and cultural heritage on the holy Ganges.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    routesCount: 45,
    minFare: '₹750'
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    title: 'The Royal Pink City',
    description: 'Majestic forts, grand palaces, and rich Rajasthani craftsmanship.',
    image: 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80',
    routesCount: 82,
    minFare: '₹450'
  },
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    title: 'Himalayan Wonderland',
    description: 'Snow-capped peaks, pine valleys, and refreshing mountain adventures.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    routesCount: 34,
    minFare: '₹1,250'
  },
  {
    name: 'Goa',
    state: 'Goa',
    title: 'Sun, Sand & Heritage',
    description: 'Pristine beaches, Portuguese architecture, and coastal nightlife.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    routesCount: 56,
    minFare: '₹850'
  },
  {
    name: 'Siliguri & Darjeeling',
    state: 'West Bengal',
    title: 'Gateway to Northeast',
    description: 'Lush tea gardens, Kanchenjunga vistas, and historic toy train heritage.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    routesCount: 38,
    minFare: '₹890'
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    title: 'Silicon Valley & Gardens',
    description: 'Dynamic cosmopolitan lifestyle, lush green parks, and vibrant craft breweries.',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    routesCount: 95,
    minFare: '₹550'
  }
];

export const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sen',
    location: 'Kolkata, WB',
    route: 'Kolkata ➔ Siliguri',
    rating: 5,
    comment: 'Booked the Greenline Platinum sleeper for my trip to North Bengal. Smooth seat selection, punctual departure from Esplanade, and super clean bedding. Best bus booking experience!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 2,
    name: 'Sunita Banerjee',
    location: 'Pune, Maharashtra',
    route: 'Mumbai ➔ Pune',
    rating: 5,
    comment: 'The saved traveller autofill saved me so much time while booking for my family of four. We selected 4 lower deck seats in seconds. Instant confirmed ticket and live GPS tracking.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 3,
    name: 'Arjun Mehra',
    location: 'New Delhi',
    route: 'Delhi ➔ Manali',
    rating: 5,
    comment: 'Travelled on the Himalayan Golden Volvo. Booking via mobile was seamless, driver details were sent promptly, and the bus was warm despite sub-zero temperatures in Himachal.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  }
];

export const INITIAL_SAVED_TRAVELLERS = [
  { id: 'st-1', name: 'Rahul Sen', age: 24, gender: 'male', phone: '9876543210' },
  { id: 'st-2', name: 'Sunita Banerjee', age: 38, gender: 'female', phone: '9876543211' },
  { id: 'st-3', name: 'Ananya Sen', age: 22, gender: 'female', phone: '9876543212' },
  { id: 'st-4', name: 'Amitabh Sen', age: 58, gender: 'male', phone: '9876543213' }
];

export const INITIAL_USER_BOOKINGS = [
  {
    id: 'BK-98F42A7C',
    pnr: 'BK-98F42A7C',
    busId: 'BUS-101',
    busName: 'Greenline Platinum Express',
    operator: 'Greenline Express',
    busNumber: 'WB-04-E-5678',
    busType: 'AC Sleeper (2+1)',
    origin: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: '2026-11-20',
    departureTime: '20:00',
    arrivalTime: '06:30',
    boardingPoint: 'Esplanade Bus Terminus (Platform 4)',
    droppingPoint: 'Tenzing Norgay Bus Stand Siliguri',
    seats: ['L1', 'L4'],
    passengers: [
      { name: 'Rahul Sen', age: 24, gender: 'male', seatNumber: 'L1' },
      { name: 'Ananya Sen', age: 22, gender: 'female', seatNumber: 'L4' }
    ],
    totalFare: 2300,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'UPI (rahul@oksbi)',
    bookedAt: '2026-11-10T14:32:00Z'
  },
  {
    id: 'BK-45D81B20',
    pnr: 'BK-45D81B20',
    busId: 'BUS-103',
    busName: 'Zingbus Maxx AC Sleeper',
    operator: 'Zingbus Intercity',
    busNumber: 'DL-01-TC-4400',
    busType: 'AC Sleeper (2+1)',
    origin: 'Delhi',
    destination: 'Jaipur',
    journeyDate: '2026-10-15',
    departureTime: '06:30',
    arrivalTime: '11:45',
    boardingPoint: 'Kashmere Gate Metro Gate 1',
    droppingPoint: 'Sindhi Camp Bus Stand Jaipur',
    seats: ['L2'],
    passengers: [
      { name: 'Rahul Sen', age: 24, gender: 'male', seatNumber: 'L2' }
    ],
    totalFare: 650,
    bookingStatus: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Debit Card',
    bookedAt: '2026-10-12T09:15:00Z'
  }
];

export const MOCK_ADMIN_METRICS = {
  totalBookings: 14820,
  totalRevenue: '₹1,84,65,900',
  registeredUsers: 8420,
  activeBuses: 124,
  occupancyRate: '87.4%',
  growthRate: '+18.2% this month',
  recentBookings: [
    { pnr: 'BK-98F42A7C', customer: 'Rahul Sen', phone: '9876543210', bus: 'Greenline Platinum Express', route: 'Kolkata ➔ Siliguri', seats: 'L1, L4', fare: '₹2,300', date: '20-Nov-2026', status: 'Confirmed' },
    { pnr: 'BK-33A19C02', customer: 'Sunita Banerjee', phone: '9876543211', bus: 'VRL I-Shift Volvo', route: 'Mumbai ➔ Pune', seats: 'L3', fare: '₹450', date: '18-Nov-2026', status: 'Confirmed' },
    { pnr: 'BK-77K88P99', customer: 'Vikramjit Singh', phone: '9811223344', bus: 'Himalayan Golden Volvo', route: 'Delhi ➔ Manali', seats: 'A1, A2', fare: '₹2,900', date: '22-Nov-2026', status: 'Confirmed' },
    { pnr: 'BK-12M44Q55', customer: 'Kavita Iyer', phone: '9444332211', bus: 'SRS Diamond Class', route: 'Bengaluru ➔ Chennai', seats: 'U4', fare: '₹899', date: '19-Nov-2026', status: 'Confirmed' },
    { pnr: 'BK-66R22T11', customer: 'Devendra Patel', phone: '9825001122', bus: 'Zingbus Maxx AC', route: 'Delhi ➔ Jaipur', seats: 'L6, L7', fare: '₹1,300', date: '21-Nov-2026', status: 'Confirmed' },
  ],
  revenueByRoute: [
    { route: 'Kolkata - Siliguri', bookings: 4210, revenue: '₹48,41,500' },
    { route: 'Delhi - Jaipur', bookings: 3840, revenue: '₹24,96,000' },
    { route: 'Delhi - Manali', bookings: 2150, revenue: '₹31,17,500' },
    { route: 'Bengaluru - Chennai', bookings: 2620, revenue: '₹20,93,380' },
    { route: 'Mumbai - Pune', bookings: 2000, revenue: '₹9,00,000' }
  ]
};
