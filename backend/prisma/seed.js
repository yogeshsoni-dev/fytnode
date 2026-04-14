'use strict';

const path = require('path');
// Must be set before any DB connection so SSL CA cert is trusted
process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, '..', 'certs', 'ca.pem');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
}

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

async function syncSequence(tableName, columnName = 'id') {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('\"${tableName}\"', '${columnName}'),
      COALESCE((SELECT MAX("${columnName}") FROM "${tableName}"), 1),
      COALESCE((SELECT MAX("${columnName}") IS NOT NULL FROM "${tableName}"), false)
    )
  `);
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding database...');

  // ── Super Admin (FytNodes owner) ─────────────────────────────────────────────
  const superAdminHash = await bcrypt.hash('superadmin123', 12);
  await prisma.user.upsert({
    where: { email: 'owner@fytnodes.com' },
    update: {},
    create: {
      email: 'owner@fytnodes.com',
      password: superAdminHash,
      name: 'FytNodes Owner',
      role: 'SUPER_ADMIN',
      gymId: null,
    },
  });
  console.log('  ✓  Super admin');

  // ── Sample Gym ───────────────────────────────────────────────────────────────
  const gym = await prisma.gym.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'FitZone Elite',
      address: '100 Fitness Blvd, Downtown',
      phone: '555-0100',
      email: 'fitzone@example.com',
      isActive: true,
    },
  });
  console.log('  ✓  1 gym');

  // ── Subscription Plans (global) ──────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Basic',
        price: 29,
        duration: 1,
        features: ['Gym Access', 'Locker Room', '2 Group Classes/month'],
        color: '#6366f1',
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Standard',
        price: 59,
        duration: 1,
        features: ['Gym Access', 'Locker Room', 'Unlimited Group Classes', '1 PT Session/month'],
        color: '#8b5cf6',
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Premium',
        price: 99,
        duration: 1,
        features: ['All Standard', '4 PT Sessions/month', 'Nutrition Consultation', 'Spa Access'],
        color: '#ec4899',
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        name: 'Annual',
        price: 799,
        duration: 12,
        features: ['All Premium', 'Priority Booking', 'Guest Passes x12', 'Free Merchandise'],
        color: '#f59e0b',
      },
    }),
  ]);
  console.log(`  ✓  ${plans.length} subscription plans`);

  // ── Admin for the gym ────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: { gymId: gym.id },
    create: {
      email: 'admin@gym.com',
      password: adminHash,
      name: 'Alex Johnson',
      role: 'ADMIN',
      gymId: gym.id,
    },
  });

  // ── Trainer users + Trainer profiles ────────────────────────────────────────
  const trainerHash = await bcrypt.hash('trainer123', 12);
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@gym.com' },
    update: { gymId: gym.id },
    create: {
      email: 'trainer@gym.com',
      password: trainerHash,
      name: 'Sarah Williams',
      role: 'TRAINER',
      gymId: gym.id,
    },
  });

  const carlosHash = await bcrypt.hash('carlos123', 12);
  const carlosUser = await prisma.user.upsert({
    where: { email: 'carlos@gym.com' },
    update: { gymId: gym.id },
    create: { email: 'carlos@gym.com', password: carlosHash, name: 'Carlos Rivera', role: 'TRAINER', gymId: gym.id },
  });

  const jessicaHash = await bcrypt.hash('jessica123', 12);
  const jessicaUser = await prisma.user.upsert({
    where: { email: 'jessica@gym.com' },
    update: { gymId: gym.id },
    create: { email: 'jessica@gym.com', password: jessicaHash, name: 'Jessica Kim', role: 'TRAINER', gymId: gym.id },
  });

  const davidHash = await bcrypt.hash('david123', 12);
  const davidUser = await prisma.user.upsert({
    where: { email: 'david@gym.com' },
    update: { gymId: gym.id },
    create: { email: 'david@gym.com', password: davidHash, name: 'David Chen', role: 'TRAINER', gymId: gym.id },
  });

  const [t1, t2, t3] = await Promise.all([
    prisma.trainer.upsert({
      where: { userId: trainerUser.id },
      update: { gymId: gym.id },
      create: {
        id: 1, userId: trainerUser.id, gymId: gym.id,
        phone: '555-0201', specialization: 'Strength & Conditioning',
        experience: 6, schedule: 'Mon-Fri 6AM-2PM', status: 'ACTIVE', rating: 4.8,
      },
    }),
    prisma.trainer.upsert({
      where: { userId: carlosUser.id },
      update: { gymId: gym.id },
      create: {
        id: 2, userId: carlosUser.id, gymId: gym.id,
        phone: '555-0202', specialization: 'Yoga & Flexibility',
        experience: 8, schedule: 'Mon-Sat 8AM-4PM', status: 'ACTIVE', rating: 4.9,
      },
    }),
    prisma.trainer.upsert({
      where: { userId: jessicaUser.id },
      update: { gymId: gym.id },
      create: {
        id: 3, userId: jessicaUser.id, gymId: gym.id,
        phone: '555-0203', specialization: 'Cardio & HIIT',
        experience: 4, schedule: 'Tue-Sun 10AM-6PM', status: 'ACTIVE', rating: 4.7,
      },
    }),
    prisma.trainer.upsert({
      where: { userId: davidUser.id },
      update: { gymId: gym.id },
      create: {
        id: 4, userId: davidUser.id, gymId: gym.id,
        phone: '555-0204', specialization: 'CrossFit & Olympic Lifting',
        experience: 10, schedule: 'N/A', status: 'INACTIVE', rating: 4.6,
      },
    }),
  ]);
  console.log('  ✓  4 trainers');

  // ── Member users + Member profiles ──────────────────────────────────────────
  const memberHash = await bcrypt.hash('member123', 12);
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@gym.com' },
    update: { gymId: gym.id },
    create: {
      email: 'member@gym.com', password: memberHash,
      name: 'Mike Davis', role: 'MEMBER', gymId: gym.id,
    },
  });

  const membersData = [
    { email: 'emma@example.com',   name: 'Emma Wilson',   password: 'emma123' },
    { email: 'james@example.com',  name: 'James Brown',   password: 'james123' },
    { email: 'olivia@example.com', name: 'Olivia Garcia', password: 'olivia123' },
    { email: 'liam@example.com',   name: 'Liam Martinez', password: 'liam123' },
    { email: 'sophia@example.com', name: 'Sophia Lee',    password: 'sophia123' },
    { email: 'noah@example.com',   name: 'Noah Taylor',   password: 'noah123' },
    { email: 'ava@example.com',    name: 'Ava Anderson',  password: 'ava123' },
  ];

  const extraMemberUsers = await Promise.all(
    membersData.map(async (m) => {
      const hash = await bcrypt.hash(m.password, 12);
      return prisma.user.upsert({
        where: { email: m.email },
        update: { gymId: gym.id },
        create: { email: m.email, password: hash, name: m.name, role: 'MEMBER', gymId: gym.id },
      });
    })
  );

  const allMemberUsers = [memberUser, ...extraMemberUsers];

  const memberProfiles = [
    { phone: '555-0101', age: 28, address: '123 Main St',    joinDate: '2024-01-15', status: 'ACTIVE',   trainerId: t1.id },
    { phone: '555-0102', age: 32, address: '456 Oak Ave',    joinDate: '2024-02-01', status: 'ACTIVE',   trainerId: t2.id },
    { phone: '555-0103', age: 25, address: '789 Pine Rd',    joinDate: '2023-11-10', status: 'ACTIVE',   trainerId: t1.id },
    { phone: '555-0104', age: 29, address: '321 Elm St',     joinDate: '2024-03-05', status: 'ACTIVE',   trainerId: t3.id },
    { phone: '555-0105', age: 35, address: '654 Maple Dr',   joinDate: '2023-09-20', status: 'EXPIRED',  trainerId: t2.id },
    { phone: '555-0106', age: 27, address: '987 Cedar Ln',   joinDate: '2024-01-30', status: 'ACTIVE',   trainerId: t3.id },
    { phone: '555-0107', age: 31, address: '147 Birch Blvd', joinDate: '2024-02-14', status: 'PENDING',  trainerId: t1.id },
    { phone: '555-0108', age: 24, address: '258 Walnut Way', joinDate: '2023-12-01', status: 'ACTIVE',   trainerId: t2.id },
  ];

  const createdMembers = await Promise.all(
    allMemberUsers.map((u, i) => {
      const p = memberProfiles[i];
      return prisma.member.upsert({
        where: { userId: u.id },
        update: { gymId: gym.id },
        create: {
          id: i + 1,
          userId: u.id,
          gymId: gym.id,
          phone: p.phone,
          age: p.age,
          address: p.address,
          joinDate: toDate(p.joinDate),
          status: p.status,
          trainerId: p.trainerId,
        },
      });
    })
  );
  console.log(`  ✓  ${createdMembers.length} members`);

  // ── Subscriptions ────────────────────────────────────────────────────────────
  const subsData = [
    { memberId: 1, planId: 1, startDate: '2024-03-01', endDate: '2024-04-01', status: 'ACTIVE',   amountPaid: 29 },
    { memberId: 2, planId: 2, startDate: '2024-02-01', endDate: '2024-03-01', status: 'ACTIVE',   amountPaid: 59 },
    { memberId: 3, planId: 3, startDate: '2024-01-01', endDate: '2024-04-01', status: 'ACTIVE',   amountPaid: 99 },
    { memberId: 4, planId: 1, startDate: '2024-03-05', endDate: '2024-04-05', status: 'ACTIVE',   amountPaid: 29 },
    { memberId: 5, planId: 2, startDate: '2023-09-20', endDate: '2023-10-20', status: 'EXPIRED',  amountPaid: 59 },
    { memberId: 6, planId: 4, startDate: '2024-01-30', endDate: '2025-01-30', status: 'ACTIVE',   amountPaid: 799 },
    { memberId: 7, planId: 1, startDate: '2024-02-14', endDate: '2024-03-14', status: 'PENDING',  amountPaid: 0 },
    { memberId: 8, planId: 3, startDate: '2023-12-01', endDate: '2024-03-01', status: 'ACTIVE',   amountPaid: 99 },
  ];

  const subs = await Promise.all(
    subsData.map((s, i) =>
      prisma.subscription.upsert({
        where: { id: i + 1 },
        update: {},
        create: {
          id: i + 1,
          memberId: createdMembers[s.memberId - 1].id,
          planId: s.planId,
          startDate: toDate(s.startDate),
          endDate: toDate(s.endDate),
          status: s.status,
          amountPaid: s.amountPaid,
        },
      })
    )
  );
  console.log(`  ✓  ${subs.length} subscriptions`);

  // ── Attendance ───────────────────────────────────────────────────────────────
  const attendanceData = [
    { memberId: 1, date: '2024-03-25', checkIn: '08:30', checkOut: '10:00' },
    { memberId: 2, date: '2024-03-25', checkIn: '09:15', checkOut: '10:45' },
    { memberId: 3, date: '2024-03-25', checkIn: '07:00', checkOut: '08:30' },
    { memberId: 1, date: '2024-03-24', checkIn: '08:45', checkOut: '10:15' },
    { memberId: 4, date: '2024-03-24', checkIn: '10:00', checkOut: '11:30' },
    { memberId: 6, date: '2024-03-24', checkIn: '06:30', checkOut: '08:00' },
    { memberId: 2, date: '2024-03-23', checkIn: '09:00', checkOut: '10:30' },
    { memberId: 8, date: '2024-03-23', checkIn: '17:30', checkOut: '19:00' },
    { memberId: 3, date: '2024-03-22', checkIn: '07:15', checkOut: '08:45' },
    { memberId: 1, date: '2024-03-22', checkIn: '08:30', checkOut: '10:00' },
  ];

  let attCount = 0;
  for (const a of attendanceData) {
    const memberId = createdMembers[a.memberId - 1].id;
    await prisma.attendance.upsert({
      where: { memberId_date: { memberId, date: toDate(a.date) } },
      update: {},
      create: {
        memberId,
        date: toDate(a.date),
        checkIn:  toDateTime(a.date, a.checkIn),
        checkOut: toDateTime(a.date, a.checkOut),
      },
    });
    attCount++;
  }
  console.log(`  ✓  ${attCount} attendance records`);

  // ── Notifications ────────────────────────────────────────────────────────────
  const notifData = [
    { type: 'RENEWAL',      title: 'Subscription Expiring Soon', message: "Liam Martinez's subscription expires in 3 days.", priority: 'HIGH',   read: false, date: '2024-03-25' },
    { type: 'PAYMENT',      title: 'Payment Pending',            message: 'Noah Taylor has a pending payment of $29.',         priority: 'HIGH',   read: false, date: '2024-03-24' },
    { type: 'ANNOUNCEMENT', title: 'New Equipment Arrived',      message: "We've installed 5 new treadmills on floor 2.",       priority: 'LOW',    read: true,  date: '2024-03-23' },
    { type: 'RENEWAL',      title: 'Subscription Expired',       message: "Ava Anderson's subscription expired yesterday.",     priority: 'MEDIUM', read: false, date: '2024-03-22' },
    { type: 'ANNOUNCEMENT', title: 'Holiday Hours',              message: 'Gym will operate from 8AM-6PM on Easter Sunday.',   priority: 'LOW',    read: true,  date: '2024-03-21' },
    { type: 'TRAINER',      title: 'Trainer Schedule Update',    message: 'David Chen is on leave until April 10th.',           priority: 'MEDIUM', read: true,  date: '2024-03-20' },
  ];

  const notifs = await Promise.all(
    notifData.map((n, i) =>
      prisma.notification.upsert({
        where: { id: i + 1 },
        update: {},
        create: {
          id: i + 1,
          type: n.type,
          title: n.title,
          message: n.message,
          priority: n.priority,
          read: n.read,
          gymId: gym.id,
          createdAt: toDate(n.date),
        },
      })
    )
  );
  console.log(`  ✓  ${notifs.length} notifications`);

  // ── Products ─────────────────────────────────────────────────────────────────
  const productsData = [
    // Proteins
    { id: 1,  name: 'Whey Protein Gold',       description: '5lb isolate, 25g protein per serving. Chocolate & Vanilla.',    price: 59.99,  stock: 100, category: 'PROTEIN',   imageUrl: null },
    { id: 2,  name: 'Casein Protein',           description: 'Slow-digesting micellar casein, 24g protein. Ideal for night.', price: 49.99,  stock: 80,  category: 'PROTEIN',   imageUrl: null },
    { id: 3,  name: 'Plant Protein Blend',      description: 'Pea + Rice protein, 22g per scoop. Vegan-friendly.',            price: 44.99,  stock: 60,  category: 'PROTEIN',   imageUrl: null },
    { id: 4,  name: 'Mass Gainer 10lb',         description: '1250 calories per serving. Serious bulk formula.',               price: 69.99,  stock: 50,  category: 'PROTEIN',   imageUrl: null },
    { id: 5,  name: 'BCAA Powder 400g',         description: '2:1:1 ratio, intra-workout recovery blend.',                    price: 29.99,  stock: 120, category: 'PROTEIN',   imageUrl: null },
    { id: 6,  name: 'Creatine Monohydrate',     description: 'Pure micronized creatine, 500g. Unflavoured.',                  price: 24.99,  stock: 150, category: 'PROTEIN',   imageUrl: null },
    // Equipment
    { id: 7,  name: 'Adjustable Dumbbell Set',  description: '5–52.5 lb per dumbbell. Space-saving design.',                  price: 299.99, stock: 20,  category: 'EQUIPMENT', imageUrl: null },
    { id: 8,  name: 'Resistance Bands Set',     description: '5-band set, 10–50 lb resistance. Includes carry bag.',          price: 34.99,  stock: 75,  category: 'EQUIPMENT', imageUrl: null },
    { id: 9,  name: 'Yoga Mat Pro',             description: '6mm thick non-slip mat, 183x61cm.',                             price: 39.99,  stock: 60,  category: 'EQUIPMENT', imageUrl: null },
    { id: 10, name: 'Pull-up Bar (Door)',        description: 'No-screw door frame pull-up bar, fits 24–36 inch doors.',       price: 49.99,  stock: 40,  category: 'EQUIPMENT', imageUrl: null },
    { id: 11, name: 'Barbell 20kg Olympic',     description: 'Standard 20kg Olympic barbell, 28mm grip, chrome.',             price: 149.99, stock: 15,  category: 'EQUIPMENT', imageUrl: null },
    { id: 12, name: 'Foam Roller',              description: 'High-density 90cm foam roller for muscle recovery.',             price: 24.99,  stock: 80,  category: 'EQUIPMENT', imageUrl: null },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`  ✓  ${productsData.length} products`);

  console.log('\n✅  Seed complete!\n');
  await Promise.all([
    syncSequence('Gym'),
    syncSequence('SubscriptionPlan'),
    syncSequence('Trainer'),
    syncSequence('Member'),
    syncSequence('Subscription'),
    syncSequence('Notification'),
    syncSequence('Product'),
  ]);
  console.log('  Sequence sync complete');
  console.log('Demo credentials:');
  console.log('  Super Admin → owner@fytnodes.com / superadmin123');
  console.log('  Admin       → admin@gym.com      / admin123');
  console.log('  Trainer     → trainer@gym.com    / trainer123');
  console.log('  Member      → member@gym.com     / member123');
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
