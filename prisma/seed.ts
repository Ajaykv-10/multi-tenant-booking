import { PrismaClient, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 0. ROLES ────────────────────────────────────────────────────────────────
  const superAdminRole = await prisma.accessRole.upsert({
    where: { name: "Super Admin" },
    update: {
      permissions: [
        "categories.view", "categories.create", "categories.edit", "categories.delete",
        "providers.view", "providers.create", "providers.edit", "providers.delete",
        "users.view", "users.create", "users.edit", "users.delete",
        "roles.view", "roles.create", "roles.edit", "roles.delete",
        "bookings.view", "bookings.create", "bookings.edit", "bookings.delete",
        "dashboard.view"
      ],
    },
    create: {
      name: "Super Admin",
      description: "Full access to all administrative modules.",
      scope: "ADMIN",
      permissions: [
        "categories.view", "categories.create", "categories.edit", "categories.delete",
        "providers.view", "providers.create", "providers.edit", "providers.delete",
        "users.view", "users.create", "users.edit", "users.delete",
        "roles.view", "roles.create", "roles.edit", "roles.delete",
        "bookings.view", "bookings.create", "bookings.edit", "bookings.delete",
        "dashboard.view"
      ],
      isSystem: true,
    },
  });

  const providerOwnerRole = await prisma.accessRole.upsert({
    where: { name: "Provider Owner" },
    update: {
      permissions: [
        "resources.view", "resources.create", "resources.edit", "resources.delete",
        "bookings.view", "bookings.edit",
        "custom_fields.view", "custom_fields.create", "custom_fields.edit", "custom_fields.delete",
        "roles.view", "roles.create", "roles.edit", "roles.delete",
        "users.view", "users.create", "users.edit", "users.delete",
        "dashboard.view"
      ],
    },
    create: {
      name: "Provider Owner",
      description: "Full access to manage your own provider resources and bookings.",
      scope: "PROVIDER",
      permissions: [
        "resources.view", "resources.create", "resources.edit", "resources.delete",
        "bookings.view", "bookings.edit",
        "custom_fields.view", "custom_fields.create", "custom_fields.edit", "custom_fields.delete",
        "roles.view", "roles.create", "roles.edit", "roles.delete",
        "users.view", "users.create", "users.edit", "users.delete",
        "dashboard.view"
      ],
      isSystem: true,
    },
  });

  console.log("✅ Roles seeded");

  // ─── 1. CATEGORIES ───────────────────────────────────────────────────────────
  const fitnessCategory = await prisma.category.upsert({
    where: { slug: "fitness" },
    update: {},
    create: { name: "Fitness", slug: "fitness" },
  });

  const beautyCategory = await prisma.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: { name: "Beauty & Wellness", slug: "beauty" },
  });

  console.log("✅ Categories seeded");

  // ─── 2. USERS ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const providerPassword = await bcrypt.hash("Provider@123", 12);
  const staffPassword = await bcrypt.hash("Staff@123", 12);
  const customerPassword = await bcrypt.hash("Customer@123", 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookingengine.com" },
    update: {
      role: "ADMIN",
      roleId: superAdminRole.id,
    },
    create: {
      email: "admin@bookingengine.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN",
      roleId: superAdminRole.id,
    },
  });

  // Provider 1 — Gym owner
  const gymOwner = await prisma.user.upsert({
    where: { email: "gymowner@bookingengine.com" },
    update: {
      role: "PROVIDER",
      roleId: providerOwnerRole.id,
    },
    create: {
      email: "gymowner@bookingengine.com",
      name: "Alex Fitness",
      password: providerPassword,
      role: "PROVIDER",
      roleId: providerOwnerRole.id,
    },
  });

  // Provider 2 — Salon owner
  const salonOwner = await prisma.user.upsert({
    where: { email: "salonowner@bookingengine.com" },
    update: {
      role: "PROVIDER",
      roleId: providerOwnerRole.id,
    },
    create: {
      email: "salonowner@bookingengine.com",
      name: "Sophie Glow",
      password: providerPassword,
      role: "PROVIDER",
      roleId: providerOwnerRole.id,
    },
  });

  // Staff member for gym
  const gymStaff = await prisma.user.upsert({
    where: { email: "gymstaff@bookingengine.com" },
    update: {
      role: "PROVIDER",
    },
    create: {
      email: "gymstaff@bookingengine.com",
      name: "James Trainer",
      password: staffPassword,
      role: "PROVIDER",
    },
  });

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@bookingengine.com" },
    update: {
      role: "CUSTOMER",
    },
    create: {
      email: "customer@bookingengine.com",
      name: "John Doe",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  console.log("✅ Users seeded");

  // ─── 3. PROVIDERS ────────────────────────────────────────────────────────────
  const gymProvider = await prisma.provider.upsert({
    where: { ownerId: gymOwner.id },
    update: {},
    create: {
      name: "AlexFit Gym",
      categoryId: fitnessCategory.id,
      ownerId: gymOwner.id,
      roleId: providerOwnerRole.id,
      users: { connect: { id: gymStaff.id } },
    },
  });

  const salonProvider = await prisma.provider.upsert({
    where: { ownerId: salonOwner.id },
    update: {},
    create: {
      name: "Sophie's Beauty Studio",
      categoryId: beautyCategory.id,
      ownerId: salonOwner.id,
      roleId: providerOwnerRole.id,
    },
  });

  // Link staff to gym provider (if not already)
  await prisma.user.update({
    where: { id: gymStaff.id },
    data: { providerId: gymProvider.id },
  });

  console.log("✅ Providers seeded");

  // ─── 4. RESOURCES ────────────────────────────────────────────────────────────
  const personalTraining = await prisma.resource.upsert({
    where: { id: "resource-personal-training" },
    update: {},
    create: {
      id: "resource-personal-training",
      name: "Personal Training Session",
      providerId: gymProvider.id,
      duration: 60, // minutes
      price: 1500,  // e.g. in paise/cents
      startTime: "08:00",
      endTime: "20:00",
    },
  });

  const yogaClass = await prisma.resource.upsert({
    where: { id: "resource-yoga-class" },
    update: {},
    create: {
      id: "resource-yoga-class",
      name: "Yoga Class",
      providerId: gymProvider.id,
      duration: 45,
      price: 800,
      startTime: "06:00",
      endTime: "18:00",
    },
  });

  const haircut = await prisma.resource.upsert({
    where: { id: "resource-haircut" },
    update: {},
    create: {
      id: "resource-haircut",
      name: "Haircut & Styling",
      providerId: salonProvider.id,
      duration: 30,
      price: 500,
      startTime: "09:00",
      endTime: "19:00",
    },
  });

  const facial = await prisma.resource.upsert({
    where: { id: "resource-facial" },
    update: {},
    create: {
      id: "resource-facial",
      name: "Deep Cleansing Facial",
      providerId: salonProvider.id,
      duration: 60,
      price: 1200,
      startTime: "10:00",
      endTime: "17:00",
    },
  });

  console.log("✅ Resources seeded");

  // ─── 5. BOOKINGS ─────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(14, 30, 0, 0);

  await prisma.booking.upsert({
    where: { id: "booking-seed-1" },
    update: {},
    create: {
      id: "booking-seed-1",
      userId: customer.id,
      resourceId: personalTraining.id,
      providerId: gymProvider.id,
      start: tomorrow,
      end: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
    },
  });

  await prisma.booking.upsert({
    where: { id: "booking-seed-2" },
    update: {},
    create: {
      id: "booking-seed-2",
      userId: customer.id,
      resourceId: haircut.id,
      providerId: salonProvider.id,
      start: nextWeek,
      end: nextWeekEnd,
      status: BookingStatus.CONFIRMED,
    },
  });

  console.log("✅ Bookings seeded");

  // ─── SUMMARY ──────────────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Seed complete!

👤 Users:
  admin@bookingengine.com       / Admin@123     (ADMIN)
  gymowner@bookingengine.com    / Provider@123  (PROVIDER)
  salonowner@bookingengine.com  / Provider@123  (PROVIDER)
  gymstaff@bookingengine.com    / Staff@123     (PROVIDER/Staff)
  customer@bookingengine.com    / Customer@123  (CUSTOMER)

🏢 Providers:  AlexFit Gym, Sophie's Beauty Studio
📦 Resources:  ${[personalTraining, yogaClass, haircut, facial].map(r => r.name).join(", ")}
📅 Bookings:   2 sample bookings for John Doe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
