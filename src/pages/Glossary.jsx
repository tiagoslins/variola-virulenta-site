import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const GlossaryPage = () => {
    const [glossaryTerms, setGlossaryTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGlossary = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('glossary').select('*').order('term', { ascending: true });
            if (error) console.error('Erro ao buscar glossário:', error); else setGlossaryTerms(data);
            setIsLoading(false);
        };
        fetchGlossary();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando glossário...</div>;
    }

    return (
        <div className="bg-black py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Glossário de Termos</h1>
                <div className="space-y-6">
                    {glossaryTerms.map(item => (
                        <div key={item.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                            <h3 className="text-2xl font-bold text-white">{item.term}</h3>
                            <p className="text-gray-400 mt-2 leading-relaxed font-serif">{item.definition}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlossaryPage;
