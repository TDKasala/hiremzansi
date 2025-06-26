import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function getPlatformDataSummary() {
  try {
    console.log('=== HIRE MZANSI PLATFORM DATA SUMMARY ===\n');

    // Get all table counts and basic stats
    const platformStats = await db.execute(sql`
      SELECT 
        'Users' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_count,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'employer' THEN 1 END) as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM users
      
      UNION ALL
      
      SELECT 
        'CVs' as table_name,
        COUNT(*) as total_count,
        0 as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM cvs
      
      UNION ALL
      
      SELECT 
        'Job Postings' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM job_postings
      
      UNION ALL
      
      SELECT 
        'Employers' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM employers
      
      UNION ALL
      
      SELECT 
        'Subscriptions' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM subscriptions
      
      UNION ALL
      
      SELECT 
        'Referrals' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN is_used = true THEN 1 END) as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM referrals
      
      UNION ALL
      
      SELECT 
        'ATS Scores' as table_name,
        COUNT(*) as total_count,
        COUNT(CASE WHEN overall_score >= 70 THEN 1 END) as verified_count,
        0 as admin_count,
        0 as employer_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
      FROM ats_scores
    `);

    // Display the summary table
    console.log('📊 PLATFORM DATA OVERVIEW:');
    console.log('┌─────────────────┬───────┬─────────┬─────────┬───────────┬─────────┐');
    console.log('│ Table           │ Total │ Active/ │ Admin   │ Employer  │ Recent  │');
    console.log('│                 │       │ Verified│         │           │ (7 days)│');
    console.log('├─────────────────┼───────┼─────────┼─────────┼───────────┼─────────┤');
    
    platformStats.forEach(row => {
      const name = row.table_name.toString().padEnd(15);
      const total = row.total_count.toString().padStart(5);
      const verified = row.verified_count.toString().padStart(7);
      const admin = row.admin_count.toString().padStart(7);
      const employer = row.employer_count.toString().padStart(9);
      const recent = row.recent_count.toString().padStart(7);
      console.log(`│ ${name} │ ${total} │ ${verified} │ ${admin} │ ${employer} │ ${recent} │`);
    });
    
    console.log('└─────────────────┴───────┴─────────┴─────────┴───────────┴─────────┘');

    // Get recent user activity
    const recentUsers = await db.execute(sql`
      SELECT email, name, role, created_at, email_verified
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n👥 RECENT USERS:');
    recentUsers.forEach((user, index) => {
      const status = user.email_verified ? '✅' : '❌';
      console.log(`   ${index + 1}. ${user.email} (${user.role}) ${status}`);
    });

    // Get recent CVs
    const recentCvs = await db.execute(sql`
      SELECT c.file_name, u.email, c.created_at
      FROM cvs c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC 
      LIMIT 5
    `);

    console.log('\n📄 RECENT CVS:');
    if (recentCvs.length === 0) {
      console.log('   No CVs uploaded yet');
    } else {
      recentCvs.forEach((cv, index) => {
        console.log(`   ${index + 1}. ${cv.file_name} by ${cv.email || 'Unknown'}`);
      });
    }

    // Get recent job postings
    const recentJobs = await db.execute(sql`
      SELECT jp.title, e.company_name, jp.created_at, jp.is_active
      FROM job_postings jp
      LEFT JOIN employers e ON jp.employer_id = e.id
      ORDER BY jp.created_at DESC 
      LIMIT 5
    `);

    console.log('\n💼 RECENT JOB POSTINGS:');
    if (recentJobs.length === 0) {
      console.log('   No job postings yet');
    } else {
      recentJobs.forEach((job, index) => {
        const status = job.is_active ? '🟢' : '🔴';
        console.log(`   ${index + 1}. ${job.title} at ${job.company_name || 'Unknown'} ${status}`);
      });
    }

    // Platform status assessment
    const totalUsers = platformStats.find(row => row.table_name === 'Users')?.total_count || 0;
    const totalCvs = platformStats.find(row => row.table_name === 'CVs')?.total_count || 0;
    const totalJobs = platformStats.find(row => row.table_name === 'Job Postings')?.total_count || 0;

    console.log('\n🎯 PLATFORM STATUS:');
    if (totalUsers <= 5 && totalCvs === 0 && totalJobs === 0) {
      console.log('   📦 DEVELOPMENT/TEST PLATFORM');
      console.log('   - Contains mostly test/admin accounts');
      console.log('   - No real user activity (CVs/jobs)');
      console.log('   - Ready for real user onboarding');
    } else if (totalUsers > 5 && (totalCvs > 0 || totalJobs > 0)) {
      console.log('   🚀 ACTIVE PRODUCTION PLATFORM');
      console.log(`   - ${totalUsers} registered users`);
      console.log(`   - ${totalCvs} CVs uploaded and analyzed`);
      console.log(`   - ${totalJobs} job postings from employers`);
    } else {
      console.log('   ⚡ EARLY STAGE PLATFORM');
      console.log('   - Some user registrations');
      console.log('   - Limited content activity');
      console.log('   - Growing user base');
    }

    console.log('\n=== END PLATFORM DATA SUMMARY ===');

  } catch (error) {
    console.error('Error getting platform data:', error);
  } finally {
    process.exit(0);
  }
}

getPlatformDataSummary();