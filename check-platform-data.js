import { Pool } from 'pg';

async function checkPlatformData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('=== PLATFORM DATA OVERVIEW ===\n');

    // Check users
    const usersResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN "emailVerified" = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'employer' THEN 1 END) as employer_users
      FROM users
    `);
    console.log('👥 USERS:');
    console.log(`   Total Users: ${usersResult.rows[0].total_users}`);
    console.log(`   Verified Users: ${usersResult.rows[0].verified_users}`);
    console.log(`   Admin Users: ${usersResult.rows[0].admin_users}`);
    console.log(`   Employer Users: ${usersResult.rows[0].employer_users}`);

    // Check recent users
    const recentUsers = await pool.query(`
      SELECT email, name, role, "createdAt", "emailVerified"
      FROM users 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);
    console.log('\n   Recent Users:');
    recentUsers.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.emailVerified ? 'Verified' : 'Unverified'}`);
    });

    // Check CVs
    const cvsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_cvs,
        COUNT(CASE WHEN "analysisStatus" = 'completed' THEN 1 END) as analyzed_cvs,
        COUNT(CASE WHEN "analysisStatus" = 'pending' THEN 1 END) as pending_cvs
      FROM cvs
    `);
    console.log('\n📄 CVS:');
    console.log(`   Total CVs: ${cvsResult.rows[0].total_cvs}`);
    console.log(`   Analyzed CVs: ${cvsResult.rows[0].analyzed_cvs}`);
    console.log(`   Pending Analysis: ${cvsResult.rows[0].pending_cvs}`);

    // Check recent CVs
    const recentCvs = await pool.query(`
      SELECT c."fileName", u.email, c."analysisStatus", c."createdAt"
      FROM cvs c
      JOIN users u ON c."userId" = u.id
      ORDER BY c."createdAt" DESC 
      LIMIT 5
    `);
    console.log('\n   Recent CVs:');
    recentCvs.rows.forEach(cv => {
      console.log(`   - ${cv.fileName} by ${cv.email} (${cv.analysisStatus})`);
    });

    // Check employers
    const employersResult = await pool.query(`
      SELECT 
        COUNT(*) as total_employers,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_employers
      FROM employers
    `);
    console.log('\n🏢 EMPLOYERS:');
    console.log(`   Total Employers: ${employersResult.rows[0].total_employers}`);
    console.log(`   Active Employers: ${employersResult.rows[0].active_employers}`);

    // Check job postings
    const jobsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_jobs,
        COUNT(CASE WHEN "createdAt" > NOW() - INTERVAL '30 days' THEN 1 END) as recent_jobs
      FROM job_postings
    `);
    console.log('\n💼 JOB POSTINGS:');
    console.log(`   Total Job Postings: ${jobsResult.rows[0].total_jobs}`);
    console.log(`   Active Jobs: ${jobsResult.rows[0].active_jobs}`);
    console.log(`   Posted Last 30 Days: ${jobsResult.rows[0].recent_jobs}`);

    // Check recent jobs
    const recentJobs = await pool.query(`
      SELECT jp.title, e."companyName", jp.location, jp."isActive", jp."createdAt"
      FROM job_postings jp
      LEFT JOIN employers e ON jp."employerId" = e.id
      ORDER BY jp."createdAt" DESC 
      LIMIT 5
    `);
    console.log('\n   Recent Job Postings:');
    recentJobs.rows.forEach(job => {
      console.log(`   - ${job.title} at ${job.companyName || 'Unknown Company'} (${job.isActive ? 'Active' : 'Inactive'})`);
    });

    // Check subscriptions
    const subscriptionsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN plan = 'premium' THEN 1 END) as premium_subscriptions
      FROM subscriptions
    `);
    console.log('\n💳 SUBSCRIPTIONS:');
    console.log(`   Total Subscriptions: ${subscriptionsResult.rows[0].total_subscriptions}`);
    console.log(`   Active Subscriptions: ${subscriptionsResult.rows[0].active_subscriptions}`);
    console.log(`   Premium Subscriptions: ${subscriptionsResult.rows[0].premium_subscriptions}`);

    // Check referrals
    const referralsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN "isUsed" = true THEN 1 END) as used_referrals,
        SUM("rewardAmount") as total_rewards
      FROM referrals
    `);
    console.log('\n🎁 REFERRALS:');
    console.log(`   Total Referrals: ${referralsResult.rows[0].total_referrals}`);
    console.log(`   Used Referrals: ${referralsResult.rows[0].used_referrals}`);
    console.log(`   Total Rewards: R${referralsResult.rows[0].total_rewards || 0}`);

    // Check ATS scores
    const atsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_scores,
        AVG("overallScore") as avg_score,
        COUNT(CASE WHEN "overallScore" >= 70 THEN 1 END) as good_scores
      FROM ats_scores
    `);
    console.log('\n📊 ATS ANALYSIS:');
    console.log(`   Total ATS Scores: ${atsResult.rows[0].total_scores}`);
    console.log(`   Average Score: ${atsResult.rows[0].avg_score ? Math.round(atsResult.rows[0].avg_score) : 0}%`);
    console.log(`   Scores ≥70%: ${atsResult.rows[0].good_scores}`);

    // Check system activity
    const activityResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE "createdAt" > NOW() - INTERVAL '7 days') as new_users_week,
        (SELECT COUNT(*) FROM cvs WHERE "createdAt" > NOW() - INTERVAL '7 days') as new_cvs_week,
        (SELECT COUNT(*) FROM job_postings WHERE "createdAt" > NOW() - INTERVAL '7 days') as new_jobs_week
    `);
    console.log('\n📈 RECENT ACTIVITY (Last 7 Days):');
    console.log(`   New Users: ${activityResult.rows[0].new_users_week}`);
    console.log(`   New CVs: ${activityResult.rows[0].new_cvs_week}`);
    console.log(`   New Job Postings: ${activityResult.rows[0].new_jobs_week}`);

    console.log('\n=== END OF PLATFORM DATA ===');

  } catch (error) {
    console.error('Error checking platform data:', error.message);
  } finally {
    await pool.end();
  }
}

checkPlatformData();