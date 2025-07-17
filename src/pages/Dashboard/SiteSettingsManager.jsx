import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../api/supabase';

/**
 * A new component for managing site-wide settings, like the homepage banner.
 * @returns {JSX.Element} The rendered SiteSettingsManager component.
 */
const SiteSettingsManager = () => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('site_settings').select('key, value');
        if (error) {
            console.error("Erro ao buscar configurações:", error);
        } else {
            const settingsMap = data.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
            setSettings(settingsMap);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        // Create an array of upsert promises
        const upsertPromises = Object.entries(settings).map(([key, value]) => 
            supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
        );

        const results = await Promise.all(upsertPromises);
        
        const hasError = results.some(res => res.error);

        if (hasError) {
            setMessage('Ocorreu um erro ao salvar as configurações.');
            console.error("Errors during upsert:", results.map(r => r.error).filter(Boolean));
        } else {
            setMessage('Configurações salvas com sucesso!');
        }

        setIsSubmitting(false);
        setTimeout(() => setMessage(''), 3000);
    };

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando configurações...</div>;
    }

    return (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Configurações Gerais do Site</h2>
            <form onSubmit={handleFormSubmit}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="main_banner_url" className="block text-gray-300 mb-2">URL do Banner Principal</label>
                        <input
                            id="main_banner_url"
                            name="main_banner_url"
                            type="url"
                            value={settings.main_banner_url || ''}
                            onChange={handleInputChange}
                            placeholder="https://exemplo.com/banner.jpg"
                            className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">Este banner aparece no topo da página inicial.</p>
                    </div>
                    {/* Add other settings fields here as needed */}
                </div>

                {message && <p className="text-green-500 text-center my-4">{message}</p>}

                <div className="mt-8">
                    <button type="submit" disabled={isSubmitting} className="bg-green-500 text-black font-bold py-2 px-6 rounded-md hover:bg-green-400 disabled:bg-gray-500">
                        {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsManager;
