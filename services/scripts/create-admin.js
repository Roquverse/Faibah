const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '/Users/arakunrincole/Documents/Faibah/admin/.env.local' });
require('dotenv').config({ path: '/Users/arakunrincole/Documents/Faibah/services/.env' }); 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const prisma = new PrismaClient();

async function main() {
  const email = 'masteradmin@faibah.com';
  const password = 'AdminPassword123!';

  console.log('Signing up admin user in Supabase via REST...');
  
  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log('Signup Response:', data);
  
  if (data.user && data.user.id) {
    await upsertPrismaUser(data.user.id, email);
  } else if (data.id) {
    await upsertPrismaUser(data.id, email);
  } else {
    console.log("Could not find user ID in response.");
  }
}

async function upsertPrismaUser(userId, email) {
  console.log('Upserting user in Prisma database...');
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: email,
        password: '',
        firstName: 'Master',
        lastName: 'Admin',
        isSuperAdmin: true,
      },
      update: {
        isSuperAdmin: true,
      }
    });
    console.log('Success! Admin credentials added to database.');
    console.log('Email:', email);
    console.log('Password:', 'AdminPassword123!');
  } catch (error) {
    console.error('Prisma operation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
