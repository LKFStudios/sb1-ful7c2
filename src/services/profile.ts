import { supabase } from '../config/supabase';
import { UserProfile, CreateProfileData, UpdateProfileData } from '../utils/types';
import { analytics } from './analytics';

export async function createUserProfile(data: CreateProfileData): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        gender: data.gender,
        birth_date: data.birthDate,
        auth_provider: data.authProvider,
        email: data.email,
        display_name: data.displayName,
        avatar_url: data.avatarUrl,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    if (!profile) throw new Error('プロフィールの作成に失敗しました');

    analytics.track('Profile Created', {
      gender: data.gender,
      authProvider: data.authProvider
    });

    return {
      id: profile.id,
      userId: profile.user_id,
      gender: profile.gender,
      birthDate: profile.birth_date,
      authProvider: profile.auth_provider,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      metadata: profile.metadata,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  } catch (error) {
    console.error('Failed to create profile:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Profile creation failed'));
    throw new Error('プロフィールの作成に失敗しました');
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.user_id,
      gender: profile.gender,
      birthDate: profile.birth_date,
      authProvider: profile.auth_provider,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      metadata: profile.metadata,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  } catch (error) {
    console.error('Failed to get profile:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Profile fetch failed'));
    throw new Error('プロフィールの取得に失敗しました');
  }
}

export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        gender: data.gender,
        birth_date: data.birthDate,
        display_name: data.displayName,
        avatar_url: data.avatarUrl,
        metadata: data.metadata
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!profile) throw new Error('プロフィールの更新に失敗しました');

    analytics.track('Profile Updated', {
      gender: data.gender
    });

    return {
      id: profile.id,
      userId: profile.user_id,
      gender: profile.gender,
      birthDate: profile.birth_date,
      authProvider: profile.auth_provider,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      metadata: profile.metadata,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  } catch (error) {
    console.error('Failed to update profile:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Profile update failed'));
    throw new Error('プロフィールの更新に失敗しました');
  }
}