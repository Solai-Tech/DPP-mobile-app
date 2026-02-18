export async function fetchTitle(urlString: string): Promise<string | null> {
  try {
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    const html = await response.text();

    const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (match) {
      const title = match[1].trim();
      return title.length > 0 ? title : null;
    }
    return null;
  } catch {
    return null;
  }
}
