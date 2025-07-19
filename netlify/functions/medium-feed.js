const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// IMPORTANTE: Adicione aqui as URLs dos seus feeds RSS do Medium
const MEDIUM_RSS_URLS = [
  'https://medium.com/feed/@linstiago',
  'https://medium.com/feed/nome-da-publicacao-2',
  // Adicione mais URLs aqui, se necessário
]; 

export const handler = async () => {
  try {
    const fetchPromises = MEDIUM_RSS_URLS.map(url => 
      fetch(`${RSS_TO_JSON_API}${url}`).then(res => res.json())
    );

    const results = await Promise.all(fetchPromises);

    let allItems = [];
    for (const result of results) {
      if (result.status === 'ok') {
        allItems = [...allItems, ...result.items];
      } else {
        console.warn(`Feed inválido ou não encontrado: ${result.feed?.url || 'URL desconhecida'}`);
      }
    }

    // Ordena todos os artigos por data de publicação (do mais recente para o mais antigo)
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return {
      statusCode: 200,
      body: JSON.stringify(allItems),
    };
  } catch (error) {
    console.error("Erro na função medium-feed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
