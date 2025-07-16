// Importa o 'fetch' para ambientes Node.js
import fetch from 'node-fetch';

// ID do seu podcast no Spotify. Encontra-se na URL do seu programa.
// Ex: https://open.spotify.com/show/AQUI_FICA_O_ID
const SHOW_ID = 'https://open.spotify.com/show/56Wa8yECt7cdx2VifBmIdb'; 
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async function(event, context) {
  try {
    // 1. Obter o Token de Acesso do Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Erro ao obter token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Buscar os últimos 21 episódios do podcast
    const episodesResponse = await fetch(`https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?limit=21&market=BR`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!episodesResponse.ok) {
      throw new Error(`Erro ao buscar episódios: ${episodesResponse.statusText}`);
    }

    const episodesData = await episodesResponse.json();

    // 3. Retornar os dados para o frontend
    return {
      statusCode: 200,
      body: JSON.stringify(episodesData.items),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
