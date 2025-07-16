// A linha 'import fetch from "node-fetch";' foi REMOVIDA.
// A função fetch nativa do ambiente Netlify será usada.

const SHOW_ID = '56Wa8yECt7cdx2VifBmIdb'; // ID do seu podcast 
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const handler = async function(event, context) {
  console.log("Iniciando a função spotify...");

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    const errorMessage = "ERRO CRÍTICO: As credenciais SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não foram encontradas nas variáveis de ambiente do Netlify.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
  console.log("Credenciais encontradas. A tentar obter o token do Spotify...");

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    console.log(`Resposta do pedido de token: ${tokenResponse.status} ${tokenResponse.statusText}`);

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      const errorMessage = `Erro ao obter token do Spotify: ${errorBody.error_description || 'Resposta inválida do Spotify.'}`;
      console.error(errorMessage, errorBody);
      throw new Error(errorMessage);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("Token obtido com sucesso. A buscar episódios...");

    const episodesResponse = await fetch(`https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?limit=21&market=BR`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log(`Resposta do pedido de episódios: ${episodesResponse.status} ${episodesResponse.statusText}`);

    if (!episodesResponse.ok) {
      const errorBody = await episodesResponse.text();
      const errorMessage = `Erro ao buscar episódios do Spotify: ${episodesResponse.statusText}. Verifique se o SHOW_ID está correto.`;
      console.error(errorMessage, errorBody);
      throw new Error(errorMessage);
    }

    const episodesData = await episodesResponse.json();
    console.log(`Sucesso! ${episodesData.items.length} episódios encontrados.`);

    return {
      statusCode: 200,
      body: JSON.stringify(episodesData.items),
    };

  } catch (error) {
    console.error("ERRO FATAL NA FUNÇÃO:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
