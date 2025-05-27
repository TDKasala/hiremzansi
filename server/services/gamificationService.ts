import { db } from "../db";
import { users, cvs, atsScores, notifications, type User } from "@shared/schema";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";
import { notificationService } from "./notificationService";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'cv_optimization' | 'job_search' | 'skills' | 'engagement' | 'milestone';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface CareerLevel {
  level: number;
  title: string;
  description: string;
  pointsRequired: number;
  benefits: string[];
  badge: string;
}

export interface UserProgress {
  userId: number;
  totalPoints: number;
  currentLevel: CareerLevel;
  nextLevel: CareerLevel | null;
  progressToNext: number;
  achievements: Achievement[];
  weeklyGoals: WeeklyGoal[];
  streaks: { [key: string]: number };
}

export interface WeeklyGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  points: number;
  expiresAt: Date;
  completed: boolean;
}

export class GamificationService {
  
  private readonly ACHIEVEMENTS: Achievement[] = [
    // CV Optimization Achievements
    {
      id: 'first_cv_upload',
      name: '🚀 First Steps',
      description: 'Upload your first CV to ATSBoost',
      icon: '🚀',
      category: 'cv_optimization',
      points: 50,
      rarity: 'common',
      maxProgress: 1
    },
    {
      id: 'cv_score_70',
      name: '📈 Rising Star',
      description: 'Achieve an ATS score of 70 or higher',
      icon: '📈',
      category: 'cv_optimization',
      points: 100,
      rarity: 'common',
      maxProgress: 1
    },
    {
      id: 'cv_score_85',
      name: '⭐ CV Expert',
      description: 'Achieve an ATS score of 85 or higher',
      icon: '⭐',
      category: 'cv_optimization',
      points: 200,
      rarity: 'rare',
      maxProgress: 1
    },
    {
      id: 'cv_score_95',
      name: '🏆 CV Master',
      description: 'Achieve an ATS score of 95 or higher',
      icon: '🏆',
      category: 'cv_optimization',
      points: 500,
      rarity: 'legendary',
      maxProgress: 1
    },
    {
      id: 'cv_optimizer',
      name: '🔧 Optimizer',
      description: 'Update your CV 5 times to improve your score',
      icon: '🔧',
      category: 'cv_optimization',
      points: 150,
      rarity: 'common',
      maxProgress: 5
    },

    // Job Search Achievements
    {
      id: 'profile_complete',
      name: '✅ Profile Pro',
      description: 'Complete your South African profile with all details',
      icon: '✅',
      category: 'job_search',
      points: 100,
      rarity: 'common',
      maxProgress: 1
    },
    {
      id: 'daily_visitor',
      name: '📅 Daily Visitor',
      description: 'Visit ATSBoost for 7 consecutive days',
      icon: '📅',
      category: 'engagement',
      points: 200,
      rarity: 'rare',
      maxProgress: 7
    },
    {
      id: 'job_match_5',
      name: '🎯 Matched',
      description: 'Get matched with 5 job opportunities',
      icon: '🎯',
      category: 'job_search',
      points: 150,
      rarity: 'common',
      maxProgress: 5
    },
    {
      id: 'premium_member',
      name: '💎 Premium Power',
      description: 'Upgrade to premium matching service',
      icon: '💎',
      category: 'milestone',
      points: 300,
      rarity: 'epic',
      maxProgress: 1
    },

    // Skills & Development
    {
      id: 'skill_diversifier',
      name: '🌟 Skill Collector',
      description: 'Add 10 different skills to your profile',
      icon: '🌟',
      category: 'skills',
      points: 100,
      rarity: 'common',
      maxProgress: 10
    },
    {
      id: 'sa_specialist',
      name: '🇿🇦 SA Specialist',
      description: 'Complete B-BBEE and NQF information',
      icon: '🇿🇦',
      category: 'skills',
      points: 150,
      rarity: 'rare',
      maxProgress: 1
    },

    // Engagement Achievements
    {
      id: 'social_butterfly',
      name: '🦋 Networker',
      description: 'Enable WhatsApp integration for job alerts',
      icon: '🦋',
      category: 'engagement',
      points: 75,
      rarity: 'common',
      maxProgress: 1
    },
    {
      id: 'feedback_giver',
      name: '💬 Community Helper',
      description: 'Provide feedback on platform features',
      icon: '💬',
      category: 'engagement',
      points: 100,
      rarity: 'common',
      maxProgress: 1
    },

    // Milestone Achievements
    {
      id: 'week_warrior',
      name: '⚡ Week Warrior',
      description: 'Complete all weekly goals for one week',
      icon: '⚡',
      category: 'milestone',
      points: 250,
      rarity: 'rare',
      maxProgress: 1
    },
    {
      id: 'month_master',
      name: '👑 Month Master',
      description: 'Complete all weekly goals for 4 consecutive weeks',
      icon: '👑',
      category: 'milestone',
      points: 1000,
      rarity: 'legendary',
      maxProgress: 4
    }
  ];

  private readonly CAREER_LEVELS: CareerLevel[] = [
    {
      level: 1,
      title: 'Job Seeker',
      description: 'Starting your career journey',
      pointsRequired: 0,
      benefits: ['Basic CV analysis', 'Job matching'],
      badge: '🌱'
    },
    {
      level: 2,
      title: 'Career Explorer',
      description: 'Actively exploring opportunities',
      pointsRequired: 200,
      benefits: ['Enhanced job alerts', 'Priority support'],
      badge: '🔍'
    },
    {
      level: 3,
      title: 'Professional',
      description: 'Building professional expertise',
      pointsRequired: 500,
      benefits: ['Advanced CV insights', 'Industry reports'],
      badge: '💼'
    },
    {
      level: 4,
      title: 'Career Specialist',
      description: 'Specialized in your field',
      pointsRequired: 1000,
      benefits: ['Personal career advisor', 'Premium features'],
      badge: '⭐'
    },
    {
      level: 5,
      title: 'Industry Expert',
      description: 'Recognized industry professional',
      pointsRequired: 2000,
      benefits: ['Exclusive opportunities', 'Mentorship programs'],
      badge: '🏆'
    },
    {
      level: 6,
      title: 'Career Master',
      description: 'Master of your career destiny',
      pointsRequired: 5000,
      benefits: ['VIP access', 'Custom solutions', 'Speaking opportunities'],
      badge: '👑'
    }
  ];

  /**
   * Get user's complete gamification progress
   */
  async getUserProgress(userId: number): Promise<UserProgress> {
    // Get user's achievements and points
    const userAchievements = await this.getUserAchievements(userId);
    const totalPoints = userAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    // Calculate current and next level
    const currentLevel = this.getCurrentLevel(totalPoints);
    const nextLevel = this.getNextLevel(currentLevel.level);
    const progressToNext = nextLevel 
      ? Math.min(((totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100, 100)
      : 100;

    // Get weekly goals
    const weeklyGoals = await this.getWeeklyGoals(userId);
    
    // Get streaks
    const streaks = await this.getUserStreaks(userId);

    return {
      userId,
      totalPoints,
      currentLevel,
      nextLevel,
      progressToNext,
      achievements: userAchievements,
      weeklyGoals,
      streaks
    };
  }

  /**
   * Check and award achievements for a user action
   */
  async checkAchievements(userId: number, action: string, data?: any): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    switch (action) {
      case 'cv_uploaded':
        if (await this.shouldAwardAchievement(userId, 'first_cv_upload')) {
          newAchievements.push(await this.awardAchievement(userId, 'first_cv_upload'));
        }
        break;

      case 'cv_scored':
        const score = data?.score || 0;
        if (score >= 95 && await this.shouldAwardAchievement(userId, 'cv_score_95')) {
          newAchievements.push(await this.awardAchievement(userId, 'cv_score_95'));
        } else if (score >= 85 && await this.shouldAwardAchievement(userId, 'cv_score_85')) {
          newAchievements.push(await this.awardAchievement(userId, 'cv_score_85'));
        } else if (score >= 70 && await this.shouldAwardAchievement(userId, 'cv_score_70')) {
          newAchievements.push(await this.awardAchievement(userId, 'cv_score_70'));
        }
        break;

      case 'profile_completed':
        if (await this.shouldAwardAchievement(userId, 'profile_complete')) {
          newAchievements.push(await this.awardAchievement(userId, 'profile_complete'));
        }
        if (data?.hasBBBEE && await this.shouldAwardAchievement(userId, 'sa_specialist')) {
          newAchievements.push(await this.awardAchievement(userId, 'sa_specialist'));
        }
        break;

      case 'premium_upgraded':
        if (await this.shouldAwardAchievement(userId, 'premium_member')) {
          newAchievements.push(await this.awardAchievement(userId, 'premium_member'));
        }
        break;

      case 'daily_login':
        await this.updateLoginStreak(userId);
        const streak = await this.getLoginStreak(userId);
        if (streak >= 7 && await this.shouldAwardAchievement(userId, 'daily_visitor')) {
          newAchievements.push(await this.awardAchievement(userId, 'daily_visitor'));
        }
        break;

      case 'whatsapp_enabled':
        if (await this.shouldAwardAchievement(userId, 'social_butterfly')) {
          newAchievements.push(await this.awardAchievement(userId, 'social_butterfly'));
        }
        break;
    }

    // Check level progression
    await this.checkLevelProgression(userId);

    return newAchievements;
  }

  /**
   * Generate weekly goals for a user
   */
  async generateWeeklyGoals(userId: number): Promise<WeeklyGoal[]> {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const goals: WeeklyGoal[] = [
      {
        id: 'weekly_cv_update',
        name: 'CV Improvement',
        description: 'Update your CV to improve your ATS score',
        targetValue: 1,
        currentValue: 0,
        points: 100,
        expiresAt: weekEnd,
        completed: false
      },
      {
        id: 'weekly_login_streak',
        name: 'Stay Active',
        description: 'Log in for 5 days this week',
        targetValue: 5,
        currentValue: 0,
        points: 150,
        expiresAt: weekEnd,
        completed: false
      },
      {
        id: 'weekly_job_applications',
        name: 'Job Hunter',
        description: 'View 10 job matches this week',
        targetValue: 10,
        currentValue: 0,
        points: 200,
        expiresAt: weekEnd,
        completed: false
      }
    ];

    return goals;
  }

  /**
   * Award achievement to user and send notification
   */
  private async awardAchievement(userId: number, achievementId: string): Promise<Achievement> {
    const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Mark achievement as unlocked
    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date(),
      progress: achievement.maxProgress
    };

    // Store achievement in database (you'd implement actual storage)
    // For now, we'll use the notification system to track

    // Send congratulatory notification
    await notificationService.createNotification({
      userId,
      type: 'achievement_unlocked',
      title: `🎉 Achievement Unlocked: ${achievement.name}`,
      message: `Congratulations! You've earned "${achievement.description}" and gained ${achievement.points} points!`,
      priority: 'high',
      actionUrl: '/profile/achievements',
      actionText: 'View Achievements',
      relatedEntityId: userId,
      relatedEntityType: 'achievement',
      deliveryMethod: ['in_app'],
    });

    return unlockedAchievement;
  }

  /**
   * Check if user should receive an achievement
   */
  private async shouldAwardAchievement(userId: number, achievementId: string): Promise<boolean> {
    // In a real implementation, you'd check the database
    // For now, return true (assume not awarded yet)
    return true;
  }

  /**
   * Get user's current achievements
   */
  private async getUserAchievements(userId: number): Promise<Achievement[]> {
    // In a real implementation, you'd fetch from database
    // For demo, return some sample achievements
    return [
      {
        ...this.ACHIEVEMENTS.find(a => a.id === 'first_cv_upload')!,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        progress: 1
      },
      {
        ...this.ACHIEVEMENTS.find(a => a.id === 'cv_score_70')!,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        progress: 1
      }
    ];
  }

  /**
   * Get current level based on points
   */
  private getCurrentLevel(points: number): CareerLevel {
    let currentLevel = this.CAREER_LEVELS[0];
    
    for (const level of this.CAREER_LEVELS) {
      if (points >= level.pointsRequired) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  }

  /**
   * Get next level
   */
  private getNextLevel(currentLevelNumber: number): CareerLevel | null {
    return this.CAREER_LEVELS.find(level => level.level === currentLevelNumber + 1) || null;
  }

  /**
   * Get weekly goals for user
   */
  private async getWeeklyGoals(userId: number): Promise<WeeklyGoal[]> {
    // In a real implementation, you'd fetch from database
    return await this.generateWeeklyGoals(userId);
  }

  /**
   * Get user streaks
   */
  private async getUserStreaks(userId: number): Promise<{ [key: string]: number }> {
    // In a real implementation, you'd calculate from database
    return {
      login: 3,
      cv_updates: 1,
      job_applications: 0
    };
  }

  /**
   * Update login streak
   */
  private async updateLoginStreak(userId: number): Promise<void> {
    // Implementation would track daily logins
    console.log(`Updated login streak for user ${userId}`);
  }

  /**
   * Get login streak
   */
  private async getLoginStreak(userId: number): Promise<number> {
    // Implementation would return actual streak
    return 3;
  }

  /**
   * Check if user leveled up
   */
  private async checkLevelProgression(userId: number): Promise<void> {
    const progress = await this.getUserProgress(userId);
    
    // If user has enough points for next level, send notification
    if (progress.nextLevel && progress.totalPoints >= progress.nextLevel.pointsRequired) {
      await notificationService.createNotification({
        userId,
        type: 'level_up',
        title: `🎊 Level Up! Welcome to ${progress.nextLevel.title}`,
        message: `You've reached level ${progress.nextLevel.level}! New benefits unlocked: ${progress.nextLevel.benefits.join(', ')}`,
        priority: 'high',
        actionUrl: '/profile/level',
        actionText: 'View Benefits',
        relatedEntityId: userId,
        relatedEntityType: 'level_up',
        deliveryMethod: ['in_app', 'email'],
      });
    }
  }

  /**
   * Get leaderboard for competitive engagement
   */
  async getLeaderboard(timeframe: 'weekly' | 'monthly' | 'all_time' = 'weekly', limit: number = 10): Promise<{
    rank: number;
    userId: number;
    username: string;
    points: number;
    level: CareerLevel;
    achievements: number;
  }[]> {
    // In a real implementation, you'd query the database
    // For demo, return sample leaderboard
    return [
      {
        rank: 1,
        userId: 1,
        username: 'career_champion',
        points: 2500,
        level: this.getCurrentLevel(2500),
        achievements: 12
      },
      {
        rank: 2,
        userId: 2,
        username: 'job_hunter_pro',
        points: 1800,
        level: this.getCurrentLevel(1800),
        achievements: 9
      },
      {
        rank: 3,
        userId: 3,
        username: 'cv_master',
        points: 1200,
        level: this.getCurrentLevel(1200),
        achievements: 7
      }
    ];
  }
}

export const gamificationService = new GamificationService();