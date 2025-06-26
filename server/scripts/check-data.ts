import { db } from '../db';
import { users, cvs, jobPostings, employers, subscriptions, referrals, atsScores } from '../../shared/schema';
import { count, avg, sql, and, gte } from 'drizzle-orm';

async function checkPlatformData() {
  try {
    console.log('=== HIRE MZANSI PLATFORM DATA OVERVIEW ===\n');

    // Users data
    const usersData = await db
      .select({
        totalUsers: count(),
        verifiedUsers: sql<number>`COUNT(CASE WHEN email_verified = true THEN 1 END)`,
        adminUsers: sql<number>`COUNT(CASE WHEN role = 'admin' THEN 1 END)`,
        employerUsers: sql<number>`COUNT(CASE WHEN role = 'employer' THEN 1 END)`
      })
      .from(users);

    console.log('👥 USERS:');
    console.log(`   Total Users: ${usersData[0].totalUsers}`);
    console.log(`   Verified Users: ${usersData[0].verifiedUsers}`);
    console.log(`   Admin Users: ${usersData[0].adminUsers}`);
    console.log(`   Employer Users: ${usersData[0].employerUsers}`);

    // Recent users
    const recentUsers = await db
      .select({
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        emailVerified: users.emailVerified
      })
      .from(users)
      .orderBy(sql`created_at DESC`)
      .limit(5);

    console.log('\n   Recent Users:');
    recentUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.emailVerified ? 'Verified' : 'Unverified'}`);
    });

    // CVs data
    const cvsData = await db
      .select({
        totalCvs: count(),
        analyzedCvs: sql<number>`COUNT(CASE WHEN analysis_status = 'completed' THEN 1 END)`,
        pendingCvs: sql<number>`COUNT(CASE WHEN analysis_status = 'pending' THEN 1 END)`
      })
      .from(cvs);

    console.log('\n📄 CVS:');
    console.log(`   Total CVs: ${cvsData[0].totalCvs}`);
    console.log(`   Analyzed CVs: ${cvsData[0].analyzedCvs}`);
    console.log(`   Pending Analysis: ${cvsData[0].pendingCvs}`);

    // Recent CVs
    const recentCvs = await db
      .select({
        fileName: cvs.fileName,
        userEmail: users.email,
        analysisStatus: cvs.analysisStatus,
        createdAt: cvs.createdAt
      })
      .from(cvs)
      .leftJoin(users, sql`${cvs.userId} = ${users.id}`)
      .orderBy(sql`${cvs.createdAt} DESC`)
      .limit(5);

    console.log('\n   Recent CVs:');
    recentCvs.forEach(cv => {
      console.log(`   - ${cv.fileName} by ${cv.userEmail} (${cv.analysisStatus})`);
    });

    // Employers data
    const employersData = await db
      .select({
        totalEmployers: count(),
        activeEmployers: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`
      })
      .from(employers);

    console.log('\n🏢 EMPLOYERS:');
    console.log(`   Total Employers: ${employersData[0].totalEmployers}`);
    console.log(`   Active Employers: ${employersData[0].activeEmployers}`);

    // Job postings data
    const jobsData = await db
      .select({
        totalJobs: count(),
        activeJobs: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`,
        recentJobs: sql<number>`COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END)`
      })
      .from(jobPostings);

    console.log('\n💼 JOB POSTINGS:');
    console.log(`   Total Job Postings: ${jobsData[0].totalJobs}`);
    console.log(`   Active Jobs: ${jobsData[0].activeJobs}`);
    console.log(`   Posted Last 30 Days: ${jobsData[0].recentJobs}`);

    // Recent job postings
    const recentJobs = await db
      .select({
        title: jobPostings.title,
        companyName: employers.companyName,
        location: jobPostings.location,
        isActive: jobPostings.isActive,
        createdAt: jobPostings.createdAt
      })
      .from(jobPostings)
      .leftJoin(employers, sql`${jobPostings.employerId} = ${employers.id}`)
      .orderBy(sql`${jobPostings.createdAt} DESC`)
      .limit(5);

    console.log('\n   Recent Job Postings:');
    recentJobs.forEach(job => {
      console.log(`   - ${job.title} at ${job.companyName || 'Unknown Company'} (${job.isActive ? 'Active' : 'Inactive'})`);
    });

    // Subscriptions data
    const subscriptionsData = await db
      .select({
        totalSubscriptions: count(),
        activeSubscriptions: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        premiumSubscriptions: sql<number>`COUNT(CASE WHEN plan = 'premium' THEN 1 END)`
      })
      .from(subscriptions);

    console.log('\n💳 SUBSCRIPTIONS:');
    console.log(`   Total Subscriptions: ${subscriptionsData[0].totalSubscriptions}`);
    console.log(`   Active Subscriptions: ${subscriptionsData[0].activeSubscriptions}`);
    console.log(`   Premium Subscriptions: ${subscriptionsData[0].premiumSubscriptions}`);

    // Referrals data
    const referralsData = await db
      .select({
        totalReferrals: count(),
        usedReferrals: sql<number>`COUNT(CASE WHEN is_used = true THEN 1 END)`,
        totalRewards: sql<number>`SUM(reward_amount)`
      })
      .from(referrals);

    console.log('\n🎁 REFERRALS:');
    console.log(`   Total Referrals: ${referralsData[0].totalReferrals}`);
    console.log(`   Used Referrals: ${referralsData[0].usedReferrals}`);
    console.log(`   Total Rewards: R${referralsData[0].totalRewards || 0}`);

    // ATS scores data
    const atsData = await db
      .select({
        totalScores: count(),
        avgScore: avg(atsScores.overallScore),
        goodScores: sql<number>`COUNT(CASE WHEN overall_score >= 70 THEN 1 END)`
      })
      .from(atsScores);

    console.log('\n📊 ATS ANALYSIS:');
    console.log(`   Total ATS Scores: ${atsData[0].totalScores}`);
    console.log(`   Average Score: ${atsData[0].avgScore ? Math.round(Number(atsData[0].avgScore)) : 0}%`);
    console.log(`   Scores ≥70%: ${atsData[0].goodScores}`);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await db
      .select({
        newUsers: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE created_at > ${sevenDaysAgo})`,
        newCvs: sql<number>`(SELECT COUNT(*) FROM ${cvs} WHERE created_at > ${sevenDaysAgo})`,
        newJobs: sql<number>`(SELECT COUNT(*) FROM ${jobPostings} WHERE created_at > ${sevenDaysAgo})`
      });

    console.log('\n📈 RECENT ACTIVITY (Last 7 Days):');
    console.log(`   New Users: ${recentActivity[0].newUsers}`);
    console.log(`   New CVs: ${recentActivity[0].newCvs}`);
    console.log(`   New Job Postings: ${recentActivity[0].newJobs}`);

    console.log('\n=== PLATFORM STATUS SUMMARY ===');
    
    if (usersData[0].totalUsers === 0) {
      console.log('⚠️  EMPTY PLATFORM - No user data found');
      console.log('   This appears to be a fresh installation with no real user activity');
    } else {
      console.log('✅ ACTIVE PLATFORM with real user data');
      console.log(`   Platform has ${usersData[0].totalUsers} registered users and ${cvsData[0].totalCvs} CVs uploaded`);
    }

    console.log('\n=== END OF PLATFORM DATA ===');

  } catch (error) {
    console.error('Error checking platform data:', error);
  } finally {
    process.exit(0);
  }
}

checkPlatformData();