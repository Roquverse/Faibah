import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const prisma = new PrismaClient();

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Missing Supabase credentials in environment. Skipping Super Admin creation.");
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'admin@faibah.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  console.log(`Setting up super admin: ${email}...`);
  
  let userId = null;
  
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
       userId = data.user?.id || data.id;
       console.log('✅ Supabase sign up successful.');
    } else {
       if (data.msg?.includes('User already registered') || data.message?.includes('User already registered') || data.code === 'user_already_exists') {
          console.log('User already exists in Supabase. Attempting to get ID...');
          const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
             userId = loginData.user?.id;
             console.log('✅ Supabase user fetched.');
          } else {
             console.warn('⚠️ Login failed, cannot get user ID:', loginData);
             return;
          }
       } else {
          console.warn('⚠️ Supabase sign up failed:', data);
          return;
       }
    }
    
    if (userId) {
       await prisma.user.upsert({
         where: { id: userId },
         create: {
           id: userId,
           email: email,
           password: '', // Password handled by Supabase
           firstName: 'Super',
           lastName: 'Admin',
           isSuperAdmin: true,
         },
         update: {
           isSuperAdmin: true,
         }
       });
       console.log('✅ Admin credentials securely added to database!');
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
