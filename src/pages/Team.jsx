import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';

const TeamPage = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
            if (error) console.error('Erro ao buscar equipa:', error); else setTeamMembers(data);
            setIsLoading(false);
        };
        fetchTeam();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando equipa...</div>;
    }

    return (
        <div className="bg-black py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Quem Somos</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
                    {teamMembers.map(member => (
                        <div key={member.id} className="p-6">
                            <img src={member.photo} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p className="text-gray-400 mb-4">{member.role}</p>
                            <Link to={`/bio/${member.id}`} className="font-bold text-green-500 hover:underline">
                                Conheça +
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamPage;
