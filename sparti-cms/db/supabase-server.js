import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[testing] Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Save a form submission to the database
 */
export async function saveFormSubmission(data) {
  try {
    const { error } = await supabase
      .from('form_submissions')
      .insert([{
        form_id: data.form_id,
        form_name: data.form_name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message
      }]);

    if (error) {
      console.error('[testing] Error saving form submission:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('[testing] Exception saving form submission:', error);
    throw error;
  }
}

/**
 * Get all form submissions for a specific form
 */
export async function getFormSubmissions(formId) {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[testing] Error fetching form submissions:', error);
      throw error;
    }

    // Transform data to match frontend format
    return data.map(submission => ({
      id: submission.id,
      date: new Date(submission.submitted_at).toLocaleString('en-SG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      data: {
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        message: submission.message
      }
    }));
  } catch (error) {
    console.error('[testing] Exception fetching form submissions:', error);
    throw error;
  }
}
