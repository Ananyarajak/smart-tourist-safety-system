const User = require('../models/User');
const Geofence = require('../models/Geofence');
const EmergencyContact = require('../models/EmergencyContact');
const Incident = require('../models/Incident');
const TouristLocation = require('../models/TouristLocation');

const seedInitialData = async () => {
  try {
    // Check if Indian seed data is already present
    const indianTourist = await User.findOne({ email: 'tourist@example.com', name: 'Ananya Sharma' });
    if (indianTourist) {
      console.log('[Seed] Indian sample data already present. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Clearing legacy seed records and populating Indian localized sample data...');
    // Clear previous seed data for clean consistency
    await User.deleteMany({ email: { $in: ['admin@touristsafety.com', 'tourist@example.com'] } });
    await Geofence.deleteMany({});
    await Incident.deleteMany({});
    await TouristLocation.deleteMany({});
    await EmergencyContact.deleteMany({});

    // 1. Create Admin User (Safety Operations Controller)
    const admin = await User.create({
      name: 'Rajesh Kumar',
      email: 'admin@touristsafety.com',
      password: 'Admin@123456',
      phone: '+91 98765 43210',
      role: 'admin',
      nationality: 'India',
      emergencyContactSummary: {
        name: 'State Disaster Response Control Room (Dial 112)',
        phone: '+91 75525 55112',
        relationship: 'Disaster Management Dispatch',
      },
    });

    // 2. Create Sample Tourist (Ananya Sharma)
    const tourist = await User.create({
      name: 'Ananya Sharma',
      email: 'tourist@example.com',
      password: 'Tourist@123456',
      phone: '+91 98260 12345',
      role: 'tourist',
      nationality: 'India',
      isTrackingActive: true,
      lastKnownLocation: {
        latitude: 22.7196,
        longitude: 75.8577,
        accuracy: 8,
        updatedAt: new Date(),
        address: 'Rajwada Palace Heritage Corridor, MG Road, Indore, MP',
      },
      emergencyContactSummary: {
        name: 'Rahul Verma',
        phone: '+91 98261 54321',
        relationship: 'Spouse',
      },
    });

    // 3. Create Emergency Contacts for Tourist
    await EmergencyContact.create([
      {
        user: tourist._id,
        name: 'Rahul Verma',
        phone: '+91 98261 54321',
        relationship: 'Spouse',
        email: 'rahul.verma@example.in',
        isPrimary: true,
      },
      {
        user: tourist._id,
        name: 'Priya Patel',
        phone: '+91 98262 67890',
        relationship: 'Certified MP Tourism Guide',
        email: 'priya.patel@mptourismguide.in',
        isPrimary: false,
      },
      {
        user: tourist._id,
        name: 'Arjun Singh',
        phone: '+91 98263 78901',
        relationship: 'Family Member',
        email: 'arjun.singh@example.in',
        isPrimary: false,
      },
      {
        user: tourist._id,
        name: 'National Tourist Helpline (Incredible India)',
        phone: '1363',
        relationship: '24/7 Government Tourist Help',
        email: 'info@tourismin-gov.in',
        isPrimary: false,
      },
    ]);

    // 4. Create Predefined Geofences in Indore & MP Heritage Corridors
    const geofences = await Geofence.create([
      {
        name: 'Rajwada Palace & Sarafa Heritage Corridor [SAFE ZONE]',
        description: 'Designated safe pedestrian cultural corridor with 24/7 tourist police assistance booths and continuous CCTV surveillance.',
        type: 'Safe',
        center: { latitude: 22.7196, longitude: 75.8577 },
        radius: 750,
        color: '#10b981',
        alertMessage: 'You are within the Rajwada Palace Heritage Safe Zone. 24/7 Tourist Police assistance booth and quick response team nearby.',
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: 'Patalpani Waterfall Gorge & Surge Area [RESTRICTED DANGER ZONE]',
        description: 'Steep rocky gorge and flash flood hazard zone. Slippery cliffs and sudden water level surges. Strictly restricted without official escort.',
        type: 'Restricted',
        center: { latitude: 22.7290, longitude: 75.8450 },
        radius: 550,
        color: '#ef4444',
        alertMessage: 'CRITICAL DANGER: You have entered the Patalpani Gorge Restricted Hazard Perimeter! Steep drop and flash flood risk. Return to the marked trail immediately.',
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: 'Chappan Dukan Smart Food Promenade [SAFE ZONE]',
        description: 'High-footfall tourist pedestrian hub with dedicated police helpdesk, smart city safety cameras, and certified medical first-aid post.',
        type: 'Safe',
        center: { latitude: 22.7244, longitude: 75.8839 },
        radius: 650,
        color: '#10b981',
        alertMessage: 'You are in the Chappan Dukan Smart Tourist Safe Zone. Emergency response team average arrival time is under 3 minutes.',
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: 'Ralamandal Wildlife Sanctuary Ridge [RESTRICTED DANGER ZONE]',
        description: 'Protected forest buffer zone with uneven terrain, wild animal movement, and zero cellular reception in deep ravines. Unauthorized entry prohibited.',
        type: 'Restricted',
        center: { latitude: 22.6850, longitude: 75.8920 },
        radius: 800,
        color: '#ef4444',
        alertMessage: 'WARNING: Restricted forest sanctuary boundary breached. Wild animal corridor detected. Retreat to highway access point immediately.',
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: 'Lal Bagh Palace Gardens & Khan Riverfront [CAUTION ZONE]',
        description: 'Historic palace perimeter with low evening lighting along the Khan riverbank. Tourists advised to stay on illuminated trails after sunset.',
        type: 'Caution',
        center: { latitude: 22.7050, longitude: 75.8480 },
        radius: 500,
        color: '#f59e0b',
        alertMessage: 'Caution: Low lighting near the palace riverbank pathway. Please keep your GPS tracking active.',
        isActive: true,
        createdBy: admin._id,
      },
    ]);

    // 5. Create Sample Incidents
    await Incident.create([
      {
        tourist: tourist._id,
        touristName: tourist.name,
        touristPhone: tourist.phone,
        type: 'SOS Emergency',
        description: 'Tourist triggered emergency SOS alert near Rajwada Palace North Gate. Dispatched nearest Cheetah Mobile Patrol.',
        location: {
          latitude: 22.7196,
          longitude: 75.8577,
          accuracy: 8,
          address: 'MG Road near Rajwada Palace North Gate, Indore',
        },
        status: 'In Progress',
        severity: 'Critical',
        assignedTo: 'Indore Police Cheetah Patrol Unit 04 (Dial 112)',
        responseNotes: [
          {
            note: 'SOS alert acknowledged by Dial 112 Command Desk. Cheetah Mobile Patrol Unit 04 dispatched.',
            author: 'Dispatcher Priya Nair',
            createdAt: new Date(Date.now() - 1000 * 60 * 18),
          },
          {
            note: 'Patrol Unit 04 reached site, established verbal contact with tourist Ananya Sharma. Situation under control.',
            author: 'Inspector Vikram Rathore',
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
          },
        ],
      },
      {
        tourist: tourist._id,
        touristName: tourist.name,
        touristPhone: tourist.phone,
        type: 'Geofence Breach',
        description: 'Tourist entered Patalpani Waterfall Gorge restricted danger perimeter.',
        location: {
          latitude: 22.7292,
          longitude: 75.8448,
          accuracy: 12,
          address: 'Patalpani Gorge Upper Trailhead, Indore District',
        },
        status: 'Resolved',
        severity: 'High',
        assignedTo: 'SDRF Forest Ranger Quick Response (Dial 112)',
        responseNotes: [
          {
            note: 'Automated SMS and audio geofence proximity alert broadcast to tourist phone.',
            author: 'Automated Geofence Safety Engine',
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
          },
          {
            note: 'Tourist safely stepped back into the marked visitor trail. Geofence violation cleared.',
            author: 'Dispatcher Priya Nair',
            createdAt: new Date(Date.now() - 1000 * 60 * 95),
          },
        ],
        resolvedAt: new Date(Date.now() - 1000 * 60 * 95),
      },
    ]);

    // 6. Create Initial Tourist Location History (Breadcrumbs)
    await TouristLocation.create([
      {
        user: tourist._id,
        latitude: 22.7185,
        longitude: 75.8565,
        accuracy: 8,
        speed: 1.1,
        address: 'Sarafa Bazaar Heritage Walk, Indore',
        currentZone: {
          geofenceId: geofences[0]._id,
          name: geofences[0].name,
          type: 'Safe',
        },
        isInRestrictedZone: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
      {
        user: tourist._id,
        latitude: 22.7196,
        longitude: 75.8577,
        accuracy: 10,
        speed: 0.7,
        address: 'Rajwada Palace Courtyard, MG Road, Indore',
        currentZone: {
          geofenceId: geofences[0]._id,
          name: geofences[0].name,
          type: 'Safe',
        },
        isInRestrictedZone: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
    ]);

    console.log('[Seed] Indian localized data successfully seeded:');
    console.log('       Admin User:   Rajesh Kumar <admin@touristsafety.com> (Admin@123456, +91 98765 43210)');
    console.log('       Tourist User: Ananya Sharma <tourist@example.com>   (Tourist@123456, +91 98260 12345)');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
};

module.exports = seedInitialData;
