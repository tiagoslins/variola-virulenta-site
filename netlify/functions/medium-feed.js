// Usamos o rss2json para converter o feed RSS (XML) para JSON, o que é muito mais fácil de usar.
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// IMPORTANTE: Substitua esta URL pela URL do seu feed RSS do Medium
const MEDIUM_RSS_URL = 'https://medium.com/feed/@linstiago'; 
'; 

export const handler = async () => {
  try {
    const response = await fetch(`${RSS_TO_JSON_API}${MEDIUM_RSS_URL}`);
    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.statusText}`);
    }
    const data = await response.json();

    // Se o feed for válido, o status será 'ok'
    if (data.status !== 'ok') {
      throw new Error('O feed RSS do Medium não é válido ou não foi encontrado.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.items), // Enviamos apenas a lista de artigos
    };
  } catch (error) {
    console.error("Erro na função medium-feed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};