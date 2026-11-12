// Comprehensive Mock Data for Bus Ticket Booking Admin Panel

export const INITIAL_BUSES = [
  {
    id: 'BUS-101',
    busNumber: 'WB-04-E-5678',
    busName: 'Greenline Platinum Express',
    operator: 'Greenline Express',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 36,
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '20:00',
    arrivalTime: '06:30',
    fare: 1150,
    status: 'Active', // Active, Maintenance, Inactive
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Reading Light', 'Emergency Exit', 'Live GPS'],
    rating: 4.8,
    assignedDriver: 'Rajesh Kumar Verma',
    lastServiceDate: '2026-11-01'
  },
  {
    id: 'BUS-102',
    busNumber: 'WB-02-B-1122',
    busName: 'Royal Cruiser Volvo Multi-Axle',
    operator: 'Royal Cruiser',
    busType: 'Multi-Axle AC Seater (2+2)',
    isAc: true,
    capacity: 44,
    origin: 'Kolkata',
    destination: 'Siliguri',
    departureTime: '21:30',
    arrivalTime: '07:45',
    fare: 950,
    status: 'Active',
    amenities: ['AC', 'Charging Point', 'Water Bottle', 'Live GPS', 'Movie Screen', 'CCTV'],
    rating: 4.6,
    assignedDriver: 'Mohammad Shamim',
    lastServiceDate: '2026-10-28'
  },
  {
    id: 'BUS-103',
    busNumber: 'DL-01-TC-4400',
    busName: 'Zingbus Maxx AC Sleeper',
    operator: 'Zingbus Intercity',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 34,
    origin: 'Delhi',
    destination: 'Jaipur',
    departureTime: '06:30',
    arrivalTime: '11:45',
    fare: 650,
    status: 'Active',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Live GPS', 'Air Freshener'],
    rating: 4.7,
    assignedDriver: 'Sukhvinder Singh',
    lastServiceDate: '2026-11-05'
  },
  {
    id: 'BUS-104',
    busNumber: 'MH-12-RN-8899',
    busName: 'VRL I-Shift Volvo B11R',
    operator: 'VRL Travels',
    busType: 'AC Seater (2+2)',
    isAc: true,
    capacity: 48,
    origin: 'Mumbai',
    destination: 'Pune',
    departureTime: '07:00',
    arrivalTime: '10:30',
    fare: 450,
    status: 'Active',
    amenities: ['AC', 'Charging Point', 'Newspaper', 'Water Bottle', 'Live GPS'],
    rating: 4.9,
    assignedDriver: 'Ganesh Patil',
    lastServiceDate: '2026-11-08'
  },
  {
    id: 'BUS-105',
    busNumber: 'KA-01-F-9900',
    busName: 'SRS Diamond Class Sleeper',
    operator: 'SRS Travels',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 32,
    origin: 'Bengaluru',
    destination: 'Chennai',
    departureTime: '23:00',
    arrivalTime: '05:30',
    fare: 890,
    status: 'Active',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Pillow', 'Water Bottle', 'Live GPS'],
    rating: 4.5,
    assignedDriver: 'Karthik Raman',
    lastServiceDate: '2026-10-15'
  },
  {
    id: 'BUS-106',
    busNumber: 'DL-04-A-1080',
    busName: 'Himalayan Golden Scania',
    operator: 'Himalayan Golden Bus',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 30,
    origin: 'Delhi',
    destination: 'Manali',
    departureTime: '17:30',
    arrivalTime: '07:30',
    fare: 1450,
    status: 'Maintenance',
    amenities: ['AC', 'Heater', 'Blanket', 'Water Bottle', 'Live GPS', 'First Aid Kit'],
    rating: 4.7,
    assignedDriver: 'Deepak Thakur',
    lastServiceDate: '2026-11-10'
  },
  {
    id: 'BUS-107',
    busNumber: 'TS-09-UB-7711',
    busName: 'Orange High-Tech Luxury Seater',
    operator: 'Orange Tours & Travels',
    busType: 'Non-AC Seater (2+2)',
    isAc: false,
    capacity: 50,
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    departureTime: '21:00',
    arrivalTime: '05:30',
    fare: 590,
    status: 'Active',
    amenities: ['Charging Point', 'Water Bottle', 'First Aid Kit', 'Emergency Exit'],
    rating: 4.2,
    assignedDriver: 'Venkatesh Rao',
    lastServiceDate: '2026-10-20'
  },
  {
    id: 'BUS-108',
    busNumber: 'KL-07-CD-3344',
    busName: 'IntrCity SmartBus Club Class',
    operator: 'IntrCity SmartBus',
    busType: 'AC Sleeper (2+1)',
    isAc: true,
    capacity: 36,
    origin: 'Bengaluru',
    destination: 'Hyderabad',
    departureTime: '22:15',
    arrivalTime: '06:45',
    fare: 1100,
    status: 'Active',
    amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Snacks', 'CCTV', 'Live GPS'],
    rating: 4.8,
    assignedDriver: 'Pradeep Nair',
    lastServiceDate: '2026-11-02'
  }
];

export const INITIAL_ROUTES = [
  {
    id: 'RT-101',
    source: 'Kolkata',
    destination: 'Siliguri',
    distance: '560 km',
    duration: '10h 30m',
    highway: 'NH-12 / NH-27',
    stops: ['Malda Town', 'Raiganj', 'Dalkhola', 'Kishanganj'],
    activeBusesCount: 14,
    baseFare: 890,
    status: 'Active'
  },
  {
    id: 'RT-102',
    source: 'Delhi',
    destination: 'Jaipur',
    distance: '280 km',
    duration: '5h 15m',
    highway: 'NH-48',
    stops: ['Gurugram', 'Manesar', 'Kotputli', 'Shahpura'],
    activeBusesCount: 38,
    baseFare: 450,
    status: 'Active'
  },
  {
    id: 'RT-103',
    source: 'Mumbai',
    destination: 'Pune',
    distance: '150 km',
    duration: '3h 30m',
    highway: 'Mumbai-Pune Expressway',
    stops: ['Navi Mumbai', 'Lonavala', 'Somatane Toll'],
    activeBusesCount: 52,
    baseFare: 350,
    status: 'Active'
  },
  {
    id: 'RT-104',
    source: 'Bengaluru',
    destination: 'Chennai',
    distance: '345 km',
    duration: '6h 30m',
    highway: 'NH-48 / NH-44',
    stops: ['Hosur', 'Krishnagiri', 'Vellore', 'Kanchipuram'],
    activeBusesCount: 26,
    baseFare: 550,
    status: 'Active'
  },
  {
    id: 'RT-105',
    source: 'Delhi',
    destination: 'Manali',
    distance: '535 km',
    duration: '14h 00m',
    highway: 'NH-3',
    stops: ['Panipat', 'Chandigarh', 'Bilaspur', 'Mandi', 'Kullu'],
    activeBusesCount: 18,
    baseFare: 1250,
    status: 'Active'
  },
  {
    id: 'RT-106',
    source: 'Hyderabad',
    destination: 'Bengaluru',
    distance: '570 km',
    duration: '8h 30m',
    highway: 'NH-44',
    stops: ['Kurnool', 'Anantapur', 'Chikkaballapur'],
    activeBusesCount: 22,
    baseFare: 950,
    status: 'Active'
  },
  {
    id: 'RT-107',
    source: 'Ahmedabad',
    destination: 'Mumbai',
    distance: '525 km',
    duration: '9h 15m',
    highway: 'NH-48',
    stops: ['Vadodara', 'Bharuch', 'Surat', 'Navsari', 'Vapi'],
    activeBusesCount: 16,
    baseFare: 800,
    status: 'Active'
  }
];

export const INITIAL_SCHEDULES = [
  {
    id: 'SCH-501',
    busId: 'BUS-101',
    busNumber: 'WB-04-E-5678',
    busName: 'Greenline Platinum Express',
    routeId: 'RT-101',
    source: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: '2026-11-20',
    departureTime: '20:00',
    arrivalTime: '06:30',
    fare: 1150,
    totalSeats: 36,
    availableSeats: 14,
    status: 'Scheduled' // Scheduled, On Route, Completed, Cancelled
  },
  {
    id: 'SCH-502',
    busId: 'BUS-102',
    busNumber: 'WB-02-B-1122',
    busName: 'Royal Cruiser Volvo Multi-Axle',
    routeId: 'RT-101',
    source: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: '2026-11-20',
    departureTime: '21:30',
    arrivalTime: '07:45',
    fare: 950,
    totalSeats: 44,
    availableSeats: 22,
    status: 'Scheduled'
  },
  {
    id: 'SCH-503',
    busId: 'BUS-103',
    busNumber: 'DL-01-TC-4400',
    busName: 'Zingbus Maxx AC Sleeper',
    routeId: 'RT-102',
    source: 'Delhi',
    destination: 'Jaipur',
    journeyDate: '2026-11-20',
    departureTime: '06:30',
    arrivalTime: '11:45',
    fare: 650,
    totalSeats: 34,
    availableSeats: 8,
    status: 'On Route'
  },
  {
    id: 'SCH-504',
    busId: 'BUS-104',
    busNumber: 'MH-12-RN-8899',
    busName: 'VRL I-Shift Volvo B11R',
    routeId: 'RT-103',
    source: 'Mumbai',
    destination: 'Pune',
    journeyDate: '2026-11-20',
    departureTime: '07:00',
    arrivalTime: '10:30',
    fare: 450,
    totalSeats: 48,
    availableSeats: 5,
    status: 'On Route'
  },
  {
    id: 'SCH-505',
    busId: 'BUS-105',
    busNumber: 'KA-01-F-9900',
    busName: 'SRS Diamond Class Sleeper',
    routeId: 'RT-104',
    source: 'Bengaluru',
    destination: 'Chennai',
    journeyDate: '2026-11-21',
    departureTime: '23:00',
    arrivalTime: '05:30',
    fare: 890,
    totalSeats: 32,
    availableSeats: 19,
    status: 'Scheduled'
  },
  {
    id: 'SCH-506',
    busId: 'BUS-108',
    busNumber: 'KL-07-CD-3344',
    busName: 'IntrCity SmartBus Club Class',
    routeId: 'RT-106',
    source: 'Hyderabad',
    destination: 'Bengaluru',
    journeyDate: '2026-11-21',
    departureTime: '22:15',
    arrivalTime: '06:45',
    fare: 1100,
    totalSeats: 36,
    availableSeats: 12,
    status: 'Scheduled'
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'BK-98F42A7C',
    pnr: 'BK-98F42A7C',
    passengerName: 'Rahul Sen',
    passengerEmail: 'rahul@yatra.com',
    passengerPhone: '+91 9876543210',
    busId: 'BUS-101',
    busName: 'Greenline Platinum Express',
    busNumber: 'WB-04-E-5678',
    operator: 'Greenline Express',
    source: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: '2026-11-20',
    departureTime: '20:00',
    arrivalTime: '06:30',
    seats: ['L1', 'L4'],
    passengers: [
      { name: 'Rahul Sen', age: 24, gender: 'male', seat: 'L1' },
      { name: 'Ananya Sen', age: 22, gender: 'female', seat: 'L4' }
    ],
    fare: 2300,
    tax: 115,
    totalAmount: 2415,
    paymentStatus: 'Paid', // Paid, Pending, Refunded, Failed
    bookingStatus: 'Confirmed', // Confirmed, Completed, Cancelled
    paymentMethod: 'UPI (rahul@oksbi)',
    bookedAt: '2026-11-10T14:32:00Z'
  },
  {
    id: 'BK-33A19C02',
    pnr: 'BK-33A19C02',
    passengerName: 'Sunita Banerjee',
    passengerEmail: 'sunita.b@gmail.com',
    passengerPhone: '+91 9876543211',
    busId: 'BUS-104',
    busName: 'VRL I-Shift Volvo B11R',
    busNumber: 'MH-12-RN-8899',
    operator: 'VRL Travels',
    source: 'Mumbai',
    destination: 'Pune',
    journeyDate: '2026-11-18',
    departureTime: '07:00',
    arrivalTime: '10:30',
    seats: ['L3'],
    passengers: [
      { name: 'Sunita Banerjee', age: 31, gender: 'female', seat: 'L3' }
    ],
    fare: 450,
    tax: 23,
    totalAmount: 473,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMethod: 'Credit Card',
    bookedAt: '2026-11-11T09:15:00Z'
  },
  {
    id: 'BK-77K88P99',
    pnr: 'BK-77K88P99',
    passengerName: 'Vikramjit Singh',
    passengerEmail: 'vikram.singh@delhicap.in',
    passengerPhone: '+91 9811223344',
    busId: 'BUS-106',
    busName: 'Himalayan Golden Scania',
    busNumber: 'DL-04-A-1080',
    operator: 'Himalayan Golden Bus',
    source: 'Delhi',
    destination: 'Manali',
    journeyDate: '2026-11-22',
    departureTime: '17:30',
    arrivalTime: '07:30',
    seats: ['L5', 'L6'],
    passengers: [
      { name: 'Vikramjit Singh', age: 29, gender: 'male', seat: 'L5' },
      { name: 'Gurpreet Kaur', age: 28, gender: 'female', seat: 'L6' }
    ],
    fare: 2900,
    tax: 145,
    totalAmount: 3045,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMethod: 'Net Banking',
    bookedAt: '2026-11-11T16:40:00Z'
  },
  {
    id: 'BK-12M44Q55',
    pnr: 'BK-12M44Q55',
    passengerName: 'Kavita Iyer',
    passengerEmail: 'kavita.iyer@chennai.net',
    passengerPhone: '+91 9444332211',
    busId: 'BUS-105',
    busName: 'SRS Diamond Class Sleeper',
    busNumber: 'KA-01-F-9900',
    operator: 'SRS Travels',
    source: 'Bengaluru',
    destination: 'Chennai',
    journeyDate: '2026-11-19',
    departureTime: '23:00',
    arrivalTime: '05:30',
    seats: ['U4'],
    passengers: [
      { name: 'Kavita Iyer', age: 27, gender: 'female', seat: 'U4' }
    ],
    fare: 890,
    tax: 45,
    totalAmount: 935,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMethod: 'UPI (kavita@icici)',
    bookedAt: '2026-11-12T10:10:00Z'
  },
  {
    id: 'BK-66R22T11',
    pnr: 'BK-66R22T11',
    passengerName: 'Devendra Patel',
    passengerEmail: 'devendra.p@gujarat.com',
    passengerPhone: '+91 9825001122',
    busId: 'BUS-103',
    busName: 'Zingbus Maxx AC Sleeper',
    busNumber: 'DL-01-TC-4400',
    operator: 'Zingbus Intercity',
    source: 'Delhi',
    destination: 'Jaipur',
    journeyDate: '2026-11-21',
    departureTime: '06:30',
    arrivalTime: '11:45',
    seats: ['L6', 'L7'],
    passengers: [
      { name: 'Devendra Patel', age: 45, gender: 'male', seat: 'L6' },
      { name: 'Meena Patel', age: 42, gender: 'female', seat: 'L7' }
    ],
    fare: 1300,
    tax: 65,
    totalAmount: 1365,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMethod: 'Debit Card',
    bookedAt: '2026-11-12T11:20:00Z'
  },
  {
    id: 'BK-99X33Z01',
    pnr: 'BK-99X33Z01',
    passengerName: 'Amitava Mukherjee',
    passengerEmail: 'amitava.m@rediffmail.com',
    passengerPhone: '+91 9830112233',
    busId: 'BUS-101',
    busName: 'Greenline Platinum Express',
    busNumber: 'WB-04-E-5678',
    operator: 'Greenline Express',
    source: 'Kolkata',
    destination: 'Siliguri',
    journeyDate: '2026-11-15',
    departureTime: '20:00',
    arrivalTime: '06:30',
    seats: ['U2'],
    passengers: [
      { name: 'Amitava Mukherjee', age: 52, gender: 'male', seat: 'U2' }
    ],
    fare: 1150,
    tax: 58,
    totalAmount: 1208,
    paymentStatus: 'Refunded',
    bookingStatus: 'Cancelled',
    paymentMethod: 'UPI',
    bookedAt: '2026-11-09T08:00:00Z'
  },
  {
    id: 'BK-55Y88K22',
    pnr: 'BK-55Y88K22',
    passengerName: 'Priya Nambiar',
    passengerEmail: 'priya.nambiar@kerala.org',
    passengerPhone: '+91 9447112233',
    busId: 'BUS-108',
    busName: 'IntrCity SmartBus Club Class',
    busNumber: 'KL-07-CD-3344',
    operator: 'IntrCity SmartBus',
    source: 'Hyderabad',
    destination: 'Bengaluru',
    journeyDate: '2026-11-21',
    departureTime: '22:15',
    arrivalTime: '06:45',
    seats: ['L10'],
    passengers: [
      { name: 'Priya Nambiar', age: 26, gender: 'female', seat: 'L10' }
    ],
    fare: 1100,
    tax: 55,
    totalAmount: 1155,
    paymentStatus: 'Pending',
    bookingStatus: 'Pending',
    paymentMethod: 'Net Banking',
    bookedAt: '2026-11-12T15:45:00Z'
  }
];

export const INITIAL_PASSENGERS = [
  {
    id: 'PAS-1001',
    name: 'Rahul Sen',
    email: 'rahul@yatra.com',
    phone: '+91 9876543210',
    city: 'Kolkata',
    totalBookings: 6,
    totalSpent: 12450,
    status: 'Active', // Active, Suspended
    joinedDate: '2025-08-14',
    frequentRoutes: ['Kolkata ➔ Siliguri', 'Delhi ➔ Jaipur']
  },
  {
    id: 'PAS-1002',
    name: 'Sunita Banerjee',
    email: 'sunita.b@gmail.com',
    phone: '+91 9876543211',
    city: 'Mumbai',
    totalBookings: 4,
    totalSpent: 4200,
    status: 'Active',
    joinedDate: '2025-11-02',
    frequentRoutes: ['Mumbai ➔ Pune']
  },
  {
    id: 'PAS-1003',
    name: 'Vikramjit Singh',
    email: 'vikram.singh@delhicap.in',
    phone: '+91 9811223344',
    city: 'Delhi',
    totalBookings: 5,
    totalSpent: 14800,
    status: 'Active',
    joinedDate: '2025-06-21',
    frequentRoutes: ['Delhi ➔ Manali', 'Delhi ➔ Jaipur']
  },
  {
    id: 'PAS-1004',
    name: 'Kavita Iyer',
    email: 'kavita.iyer@chennai.net',
    phone: '+91 9444332211',
    city: 'Chennai',
    totalBookings: 8,
    totalSpent: 8900,
    status: 'Active',
    joinedDate: '2025-03-10',
    frequentRoutes: ['Bengaluru ➔ Chennai']
  },
  {
    id: 'PAS-1005',
    name: 'Devendra Patel',
    email: 'devendra.p@gujarat.com',
    phone: '+91 9825001122',
    city: 'Ahmedabad',
    totalBookings: 3,
    totalSpent: 5100,
    status: 'Active',
    joinedDate: '2026-01-19',
    frequentRoutes: ['Ahmedabad ➔ Mumbai']
  },
  {
    id: 'PAS-1006',
    name: 'Amitava Mukherjee',
    email: 'amitava.m@rediffmail.com',
    phone: '+91 9830112233',
    city: 'Kolkata',
    totalBookings: 2,
    totalSpent: 2400,
    status: 'Active',
    joinedDate: '2026-04-05',
    frequentRoutes: ['Kolkata ➔ Siliguri']
  },
  {
    id: 'PAS-1007',
    name: 'Priya Nambiar',
    email: 'priya.nambiar@kerala.org',
    phone: '+91 9447112233',
    city: 'Bengaluru',
    totalBookings: 7,
    totalSpent: 9600,
    status: 'Active',
    joinedDate: '2025-09-30',
    frequentRoutes: ['Hyderabad ➔ Bengaluru']
  },
  {
    id: 'PAS-1008',
    name: 'Farhan Akhtar Qureshi',
    email: 'farhan.q@outlook.com',
    phone: '+91 9890445566',
    city: 'Lucknow',
    totalBookings: 1,
    totalSpent: 750,
    status: 'Suspended',
    joinedDate: '2026-02-14',
    frequentRoutes: ['Lucknow ➔ Delhi']
  }
];

export const INITIAL_DRIVERS = [
  {
    id: 'DRV-201',
    name: 'Rajesh Kumar Verma',
    phone: '+91 9831002233',
    licenseNumber: 'WB-19980023451',
    experienceYears: 14,
    assignedBus: 'WB-04-E-5678 (Greenline Platinum Express)',
    busId: 'BUS-101',
    status: 'Available', // Available, On Journey, On Leave
    rating: 4.9,
    tripsCompleted: 480,
    joinedDate: '2022-04-12'
  },
  {
    id: 'DRV-202',
    name: 'Mohammad Shamim',
    phone: '+91 9830887766',
    licenseNumber: 'WB-20050098124',
    experienceYears: 12,
    assignedBus: 'WB-02-B-1122 (Royal Cruiser Volvo)',
    busId: 'BUS-102',
    status: 'On Journey',
    rating: 4.7,
    tripsCompleted: 395,
    joinedDate: '2022-08-19'
  },
  {
    id: 'DRV-203',
    name: 'Sukhvinder Singh',
    phone: '+91 9814223311',
    licenseNumber: 'PB-20010045231',
    experienceYears: 16,
    assignedBus: 'DL-01-TC-4400 (Zingbus Maxx)',
    busId: 'BUS-103',
    status: 'On Journey',
    rating: 4.8,
    tripsCompleted: 620,
    joinedDate: '2021-02-10'
  },
  {
    id: 'DRV-204',
    name: 'Ganesh Patil',
    phone: '+91 9822445566',
    licenseNumber: 'MH-20080077889',
    experienceYears: 9,
    assignedBus: 'MH-12-RN-8899 (VRL I-Shift Volvo)',
    busId: 'BUS-104',
    status: 'Available',
    rating: 4.8,
    tripsCompleted: 310,
    joinedDate: '2023-01-15'
  },
  {
    id: 'DRV-205',
    name: 'Karthik Raman',
    phone: '+91 9840112244',
    licenseNumber: 'TN-20100033445',
    experienceYears: 11,
    assignedBus: 'KA-01-F-9900 (SRS Diamond Class)',
    busId: 'BUS-105',
    status: 'Available',
    rating: 4.6,
    tripsCompleted: 420,
    joinedDate: '2022-11-01'
  },
  {
    id: 'DRV-206',
    name: 'Deepak Thakur',
    phone: '+91 9816001122',
    licenseNumber: 'HP-20040088991',
    experienceYears: 15,
    assignedBus: 'DL-04-A-1080 (Himalayan Scania)',
    busId: 'BUS-106',
    status: 'On Leave',
    rating: 4.9,
    tripsCompleted: 540,
    joinedDate: '2021-06-25'
  }
];

export const INITIAL_STAFF = [
  {
    id: 'STF-301',
    name: 'Vikram Das',
    email: 'admin@bharatbus.com',
    phone: '+91 9811223344',
    role: 'Super Admin',
    branch: 'National HQ - New Delhi',
    status: 'Active',
    joinedDate: '2021-01-01'
  },
  {
    id: 'STF-302',
    name: 'Aniruddha Bose',
    email: 'aniruddha.bose@yatra.com',
    phone: '+91 9830554433',
    role: 'Fleet Manager',
    branch: 'Eastern Terminal Hub - Kolkata',
    status: 'Active',
    joinedDate: '2022-03-15'
  },
  {
    id: 'STF-303',
    name: 'Meenakshi Sundaram',
    email: 'meenakshi.s@yatra.com',
    phone: '+91 9444118899',
    role: 'Operations Lead',
    branch: 'Southern Hub - Bengaluru',
    status: 'Active',
    joinedDate: '2022-07-20'
  },
  {
    id: 'STF-304',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@yatra.com',
    phone: '+91 9820776655',
    role: 'Terminal Dispatcher',
    branch: 'Western Hub - Mumbai Borivali',
    status: 'Active',
    joinedDate: '2023-05-10'
  },
  {
    id: 'STF-305',
    name: 'Shalini Sharma',
    email: 'shalini.s@yatra.com',
    phone: '+91 9810334455',
    role: 'Customer Support Lead',
    branch: 'Central Support - Gurugram',
    status: 'Active',
    joinedDate: '2023-09-01'
  }
];

export const INITIAL_PAYMENTS = [
  {
    id: 'TXN-99101',
    bookingId: 'BK-98F42A7C',
    passengerName: 'Rahul Sen',
    amount: 2415,
    paymentMethod: 'UPI',
    providerReference: 'UPI-SBI-88291048',
    status: 'Success', // Success, Pending, Failed
    refundStatus: 'None', // None, Requested, Processed
    date: '2026-11-10 14:32'
  },
  {
    id: 'TXN-99102',
    bookingId: 'BK-33A19C02',
    passengerName: 'Sunita Banerjee',
    amount: 473,
    paymentMethod: 'Credit Card',
    providerReference: 'HDFC-PG-77192038',
    status: 'Success',
    refundStatus: 'None',
    date: '2026-11-11 09:15'
  },
  {
    id: 'TXN-99103',
    bookingId: 'BK-77K88P99',
    passengerName: 'Vikramjit Singh',
    amount: 3045,
    paymentMethod: 'Net Banking',
    providerReference: 'ICICI-NET-44910293',
    status: 'Success',
    refundStatus: 'None',
    date: '2026-11-11 16:40'
  },
  {
    id: 'TXN-99104',
    bookingId: 'BK-12M44Q55',
    passengerName: 'Kavita Iyer',
    amount: 935,
    paymentMethod: 'UPI',
    providerReference: 'GPay-AXIS-99201948',
    status: 'Success',
    refundStatus: 'None',
    date: '2026-11-12 10:10'
  },
  {
    id: 'TXN-99105',
    bookingId: 'BK-66R22T11',
    passengerName: 'Devendra Patel',
    amount: 1365,
    paymentMethod: 'Debit Card',
    providerReference: 'SBI-DC-66291039',
    status: 'Success',
    refundStatus: 'None',
    date: '2026-11-12 11:20'
  },
  {
    id: 'TXN-99106',
    bookingId: 'BK-99X33Z01',
    passengerName: 'Amitava Mukherjee',
    amount: 1208,
    paymentMethod: 'UPI',
    providerReference: 'UPI-PAYTM-11029384',
    status: 'Success',
    refundStatus: 'Processed',
    date: '2026-11-09 08:00'
  },
  {
    id: 'TXN-99107',
    bookingId: 'BK-55Y88K22',
    passengerName: 'Priya Nambiar',
    amount: 1155,
    paymentMethod: 'Net Banking',
    providerReference: 'KBL-NET-Pending',
    status: 'Pending',
    refundStatus: 'None',
    date: '2026-11-12 15:45'
  }
];

export const INITIAL_OFFERS = [
  {
    id: 'OFF-401',
    code: 'FIRSTYATRA',
    title: 'New User Welcome Discount',
    discountPercentage: 15,
    maxDiscount: 200,
    minBookingAmount: 500,
    expiryDate: '2026-12-31',
    usageCount: 1420,
    usageLimit: 5000,
    status: 'Active',
    description: '15% off up to ₹200 for your first booking on our platform.'
  },
  {
    id: 'OFF-402',
    code: 'FESTIVE10',
    title: 'Winter Holiday Special',
    discountPercentage: 10,
    maxDiscount: 350,
    minBookingAmount: 1000,
    expiryDate: '2026-12-15',
    usageCount: 890,
    usageLimit: 3000,
    status: 'Active',
    description: 'Get flat 10% discount on interstate holiday routes.'
  },
  {
    id: 'OFF-403',
    code: 'SUPERBUS',
    title: 'Volvo & Scania Luxury Pass',
    discountPercentage: 20,
    maxDiscount: 400,
    minBookingAmount: 1500,
    expiryDate: '2026-11-30',
    usageCount: 512,
    usageLimit: 1000,
    status: 'Active',
    description: '20% off on all Multi-Axle Volvo & Scania buses.'
  },
  {
    id: 'OFF-404',
    code: 'RETURN25',
    title: 'Round Trip Rebate',
    discountPercentage: 25,
    maxDiscount: 500,
    minBookingAmount: 2000,
    expiryDate: '2026-10-31',
    usageCount: 994,
    usageLimit: 1000,
    status: 'Expired',
    description: 'Save 25% on round trip ticket purchases.'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'REV-601',
    passengerName: 'Rahul Sen',
    busName: 'Greenline Platinum Express',
    route: 'Kolkata ➔ Siliguri',
    rating: 5,
    date: '2026-11-11',
    comment: 'Exceptional journey! The Volvo sleeper was clean, blanket was hygienic, and bus reached Siliguri sharp at 6:20 AM. Charging ports worked smoothly.',
    status: 'Published' // Published, Under Review, Flagged
  },
  {
    id: 'REV-602',
    passengerName: 'Sunita Banerjee',
    busName: 'VRL I-Shift Volvo B11R',
    route: 'Mumbai ➔ Pune',
    rating: 5,
    date: '2026-11-10',
    comment: 'Punctual departure from Dadar TT Circle. Driver drove very safely on the expressway. Smooth AC cooling.',
    status: 'Published'
  },
  {
    id: 'REV-603',
    passengerName: 'Vikramjit Singh',
    busName: 'Himalayan Golden Scania',
    route: 'Delhi ➔ Manali',
    rating: 4,
    date: '2026-11-08',
    comment: 'Great views and warm blankets. The road near Mandi was bumpy due to construction, but the driver was very skilled.',
    status: 'Published'
  },
  {
    id: 'REV-604',
    passengerName: 'Pooja Hegde',
    busName: 'SRS Diamond Class',
    route: 'Bengaluru ➔ Chennai',
    rating: 3,
    date: '2026-11-07',
    comment: 'Bus departed 25 minutes late from Majestic, although the rest of the ride was decent and AC was working well.',
    status: 'Published'
  },
  {
    id: 'REV-605',
    passengerName: 'Kunal Verma',
    busName: 'Zingbus Maxx AC',
    route: 'Delhi ➔ Jaipur',
    rating: 2,
    date: '2026-11-05',
    comment: 'The onboard WiFi was not connecting throughout Haryana highway. Rest of facilities were acceptable.',
    status: 'Flagged'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'New Booking Confirmed',
    message: 'Booking BK-98F42A7C confirmed for Rahul Sen (Kolkata ➔ Siliguri, ₹2,415).',
    category: 'booking', // booking, payment, cancellation, alert
    time: '10 mins ago',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'Payment Settlement Received',
    message: 'UPI transaction TXN-99104 of ₹935 cleared by Axis Bank gateway.',
    category: 'payment',
    time: '25 mins ago',
    read: false
  },
  {
    id: 'NOTIF-3',
    title: 'Booking Cancellation & Refund',
    message: 'Booking BK-99X33Z01 cancelled by passenger. Refund of ₹1,208 auto-dispatched.',
    category: 'cancellation',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'NOTIF-4',
    title: 'Bus Maintenance Reminder',
    message: 'Bus DL-04-A-1080 (Himalayan Scania) scheduled for routine engine brake inspection.',
    category: 'alert',
    time: '4 hours ago',
    read: true
  },
  {
    id: 'NOTIF-5',
    title: 'Driver Shift Assignment',
    message: 'Driver Sukhvinder Singh assigned to Morning Express Schedule SCH-503.',
    category: 'alert',
    time: '1 day ago',
    read: true
  }
];

export const INITIAL_SETTINGS = {
  adminName: 'Vikram Das',
  adminEmail: 'admin@bharatbus.com',
  adminPhone: '+91 9811223344',
  adminRole: 'Super Admin',
  platformTitle: 'BharatBus Logistics & Fleet Operations',
  currency: 'INR (₹)',
  taxGstRate: 5,
  supportEmail: 'support@bharatbus.com',
  supportHelpline: '1800-200-9988',
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: true,
  dailyDigest: true,
  soundAlerts: false
};

// Analytics Mock Datasets for Recharts
export const REVENUE_MONTHLY_DATA = [
  { month: 'Jun', revenue: 1120000, bookings: 1250, passengers: 1980 },
  { month: 'Jul', revenue: 1350000, bookings: 1480, passengers: 2340 },
  { month: 'Aug', revenue: 1290000, bookings: 1410, passengers: 2210 },
  { month: 'Sep', revenue: 1540000, bookings: 1720, passengers: 2790 },
  { month: 'Oct', revenue: 1880000, bookings: 2100, passengers: 3450 },
  { month: 'Nov', revenue: 2150000, bookings: 2420, passengers: 3980 }
];

export const BOOKING_STATUS_PIE = [
  { name: 'Confirmed', value: 78, color: '#10B981' },
  { name: 'Completed', value: 14, color: '#3B82F6' },
  { name: 'Pending', value: 5, color: '#F59E0B' },
  { name: 'Cancelled', value: 3, color: '#EF4444' }
];

export const BUS_TYPE_STATS = [
  { type: 'AC Sleeper (2+1)', count: 48, percentage: 40 },
  { type: 'Multi-Axle Seater (2+2)', count: 36, percentage: 30 },
  { type: 'AC Seater (2+2)', count: 24, percentage: 20 },
  { type: 'Non-AC Seater', count: 12, percentage: 10 }
];

export const HIGHWAY_CORRIDOR_METRICS = [
  { corridor: 'Kolkata - Siliguri', trips: 420, revenue: 4841500, occupancy: 92 },
  { corridor: 'Delhi - Jaipur', trips: 1140, revenue: 2496000, occupancy: 88 },
  { corridor: 'Delhi - Manali', trips: 310, revenue: 3117500, occupancy: 95 },
  { corridor: 'Bengaluru - Chennai', trips: 780, revenue: 2093380, occupancy: 84 },
  { corridor: 'Mumbai - Pune', trips: 1560, revenue: 900000, occupancy: 86 }
];
