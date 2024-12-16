import { supabase } from '../config/supabase';
import { UserPreferences, UpdatePreferencesData } from '../utils/types';

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      theme: data.theme,
      notificationEnabled: data.notification_enabled,
      dailyReminderTime: data.daily_reminder_time,
      language: data.language,
      customSettings: data.custom_settings
    } : null;
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    throw new Error('設定の取得に失敗しました');
  }
}

export async function updateUserPreferences(data: UpdatePreferencesData): Promise<UserPreferences> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');

    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw fetchError;
    }

    const updateData = {
      user_id: user.id,
      ...data,
      custom_settings: existingPrefs 
        ? { ...existingPrefs.custom_settings, ...data.customSettings }
        : data.customSettings
    };

    const { data: updatedPrefs, error: updateError } = await supabase
      .from('user_preferences')
      .upsert(updateData)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedPrefs) throw new Error('設定の更新に失敗しました');

    return {
      id: updatedPrefs.id,
      userId: updatedPrefs.user_id,
      theme: updatedPrefs.theme,
      notificationEnabled: updatedPrefs.notification_enabled,
      dailyReminderTime: updatedPrefs.daily_reminder_time,
      language: updatedPrefs.language,
      customSettings: updatedPrefs.custom_settings
    };
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    throw new Error('設定の更新に失敗しました');
  }
}

export async function initializeUserPreferences(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!data && !error) {
      await updateUserPreferences({
        theme: 'light',
        notificationEnabled: true,
        dailyReminderTime: '09:00',
        language: 'ja',
        customSettings: {
          skincare: {
            routine: [],
            products: [],
            concerns: []
          },
          exercise: {
            routine: [],
            frequency: 7,
            duration: 30
          },
          diet: {
            restrictions: [],
            goals: []
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize user preferences:', error);
  }
}