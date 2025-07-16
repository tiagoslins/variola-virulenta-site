import fetch from 'node-fetch';

// ID do seu podcast já inserido corretamente
const SHOW_ID = '56Wa8yECt7cdx2VifBmIdb'; 
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const handler = async function(event, context) {
  // Verifica se as variáveis de ambiente foram carregadas
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "As credenciais do Spotify não foram encontradas nas variáveis de ambiente do Netlify." }),
    };
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      throw new Error(`Erro ao obter token: ${errorBody.error_description}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const episodesResponse = await fetch(`https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?limit=21&market=BR`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!episodesResponse.ok) {
      throw new Error(`Erro ao buscar episódios: ${episodesResponse.statusText}`);
    }

    const episodesData = await episodesResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(episodesData.items),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
