import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Articles ---
export const getHomepageArticles = () => 
    supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false }).limit(6);

export const getAllArticles = () => 
    supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false });

export const getArticleById = (id) => 
    supabase.from('articles').select('*, profiles(full_name)').eq('id', id).single();

export const getArticlesByTag = (tag) => 
    supabase.from('articles').select('*, profiles(full_name)').contains('tags', [tag]).order('createdAt', { ascending: false });

export const searchArticles = (query) => 
    supabase.from('articles').select('*, profiles(full_name)').ilike('title', `%${query}%`).order('createdAt', { ascending: false });

// --- Auth ---
export const getProfile = (userId) => 
    supabase.from('profiles').select('role, full_name').eq('id', userId).single();

// --- Other API functions for Team, Glossary, etc. would go here ---