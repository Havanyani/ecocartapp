import { offlineStorageService } from './OfflineStorageService';
import { apiClient } from './apiClient';

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  level: number;
  achievements: Achievement[];
  stats: UserStats;
  joinDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

export interface UserStats {
  totalCollections: number;
  totalWeight: number;
  streak: number;
  rank: number;
  points: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

class CommunityService {
  private static instance: CommunityService;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  public async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `profile_${userId}`;
    const cachedProfile = await offlineStorageService.getCachedData<UserProfile>(cacheKey);
    
    if (cachedProfile) {
      return cachedProfile;
    }

    const response = await apiClient.get(`/community/profiles/${userId}`);
    const profile = response.data;
    
    await offlineStorageService.cacheData(cacheKey, profile, this.CACHE_TTL);
    return profile;
  }

  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch(`/community/profiles/${userId}`, updates);
    const updatedProfile = response.data;
    
    // Update cache
    const cacheKey = `profile_${userId}`;
    await offlineStorageService.cacheData(cacheKey, updatedProfile, this.CACHE_TTL);
    
    // Add to sync queue for offline support
    await offlineStorageService.addToSyncQueue({
      type: 'UPDATE_PROFILE',
      payload: { userId, updates },
    });

    return updatedProfile;
  }

  public async getCommunityPosts(page: number = 1, limit: number = 10): Promise<CommunityPost[]> {
    const cacheKey = `posts_page_${page}`;
    const cachedPosts = await offlineStorageService.getCachedData<CommunityPost[]>(cacheKey);
    
    if (cachedPosts) {
      return cachedPosts;
    }

    const response = await apiClient.get('/community/posts', {
      params: { page, limit },
    });
    const posts = response.data;
    
    await offlineStorageService.cacheData(cacheKey, posts, this.CACHE_TTL);
    return posts;
  }

  public async createPost(content: string, images?: string[]): Promise<CommunityPost> {
    const response = await apiClient.post('/community/posts', { content, images });
    const post = response.data;
    
    // Add to sync queue for offline support
    await offlineStorageService.addToSyncQueue({
      type: 'CREATE_POST',
      payload: { content, images },
    });

    return post;
  }

  public async likePost(postId: string): Promise<void> {
    await apiClient.post(`/community/posts/${postId}/like`);
    
    // Add to sync queue for offline support
    await offlineStorageService.addToSyncQueue({
      type: 'LIKE_POST',
      payload: { postId },
    });
  }

  public async getComments(postId: string): Promise<Comment[]> {
    const cacheKey = `comments_${postId}`;
    const cachedComments = await offlineStorageService.getCachedData<Comment[]>(cacheKey);
    
    if (cachedComments) {
      return cachedComments;
    }

    const response = await apiClient.get(`/community/posts/${postId}/comments`);
    const comments = response.data;
    
    await offlineStorageService.cacheData(cacheKey, comments, this.CACHE_TTL);
    return comments;
  }

  public async addComment(postId: string, content: string): Promise<Comment> {
    const response = await apiClient.post(`/community/posts/${postId}/comments`, { content });
    const comment = response.data;
    
    // Add to sync queue for offline support
    await offlineStorageService.addToSyncQueue({
      type: 'ADD_COMMENT',
      payload: { postId, content },
    });

    return comment;
  }

  public async getLeaderboard(): Promise<UserProfile[]> {
    const cacheKey = 'leaderboard';
    const cachedLeaderboard = await offlineStorageService.getCachedData<UserProfile[]>(cacheKey);
    
    if (cachedLeaderboard) {
      return cachedLeaderboard;
    }

    const response = await apiClient.get('/community/leaderboard');
    const leaderboard = response.data;
    
    await offlineStorageService.cacheData(cacheKey, leaderboard, this.CACHE_TTL);
    return leaderboard;
  }

  public async getAchievements(userId: string): Promise<Achievement[]> {
    const cacheKey = `achievements_${userId}`;
    const cachedAchievements = await offlineStorageService.getCachedData<Achievement[]>(cacheKey);
    
    if (cachedAchievements) {
      return cachedAchievements;
    }

    const response = await apiClient.get(`/community/profiles/${userId}/achievements`);
    const achievements = response.data;
    
    await offlineStorageService.cacheData(cacheKey, achievements, this.CACHE_TTL);
    return achievements;
  }
}

export const communityService = CommunityService.getInstance(); 