const { createClient } = require('@supabase/supabase-js');

// Load env vars manually for the script since it's running outside Next.js context temporarily
const supabaseUrl = 'https://eehyzabcafacvabgvuoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlaHl6YWJjYWZhY3ZhYmd2dW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIxMDEzNSwiZXhwIjoyMDg1Nzg2MTM1fQ.FHXQcz2W-ctGD2HwdaC4A5VxeVOIZf6qNnzd4VNiMkU'; // Using Service Role to bypass RLS for seeding

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create a User Profile (Ghost User)
  // In a real app, this happens on Auth sign-up. Here we fake it.
  const userId = '00000000-0000-0000-0000-000000000000'; // Special zero UUID
  
  // Note: We can't insert into auth.users easily without admin API, 
  // but we can insert into public.profiles if our foreign key constraint allows it 
  // OR we just create a community without a creator_id for now if constraint allows nulls.
  // Checking schema... creator_id is nullable? No, I defined it as just UUID. 
  // Let's check the schema again. 
  // "creator_id uuid references public.profiles(id)"
  // "public.profiles.id references auth.users"
  
  // Okay, seeding is tricky with foreign keys to auth. 
  // Let's create a community with NO creator for the MVP seed to bypass auth requirement for now.
  // I'll need to drop the NOT NULL constraint or the Foreign Key temporarily? 
  // Actually, I'll just create a community. If creator_id is not null, I might fail.
  // Let's try inserting a community with a random UUID for creator and hope RLS/FK doesn't explode 
  // (it will explode if FK exists).
  
  // Pivot: I will try to sign up a dummy user via the API first.
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: 'admin@opentownhall.com',
    password: 'securepassword123',
  });

  if (authError) {
      console.log('User might already exist:', authError.message);
  }

  const realUserId = authUser?.user?.id;

  if (!realUserId) {
      console.log('⚠️ Could not get a user ID. Creating community with NULL creator (if allowed) or skipping.');
      return;
  }

  console.log('User ID:', realUserId);

  // 2. Create Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: realUserId, username: 'SystemAdmin', avatar_url: 'https://github.com/shadcn.png' });
  
  if (profileError) console.error('Profile Error:', profileError);

  // 3. Create Community
  const { data: community, error: commError } = await supabase
    .from('communities')
    .upsert({ name: 'DemocracyNow', description: 'A place to discuss open governance.', creator_id: realUserId }, { onConflict: 'name' })
    .select()
    .single();

  if (commError) {
      console.error('Community Error:', commError);
      return;
  }
  
  console.log('Community created:', community.name);

  // 4. Create Post
  const { error: postError } = await supabase
    .from('posts')
    .insert({
        community_id: community.id,
        author_id: realUserId,
        title: 'Welcome to Open Town Hall!',
        body: 'This is the first post on the platform. Moderators here are elected, not appointed.',
        upvotes: 1
    });

  if (postError) console.error('Post Error:', postError);
  else console.log('✅ Seed complete!');
}

seed();
