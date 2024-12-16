import { supabase } from '../config/supabase';
import { AnalysisResult } from '../utils/types';

export async function saveAnalysis(result: AnalysisResult) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        scores: result.scores,
        detailed_scores: result.detailedScores,
        image_url: result.imageUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to save analysis:', error);
    throw new Error('分析結果の保存に失敗しました');
  }
}

export async function getAnalyses() {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    throw new Error('分析履歴の取得に失敗しました');
  }
}

export async function getAnalysis(id: string) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    throw new Error('分析結果の取得に失敗しました');
  }
}