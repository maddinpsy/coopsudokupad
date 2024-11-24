export async function onRequest(request) {
    const url = new URL(request.url);
    url.hostname = 'another-domain.de';
    const response = await fetch(url)
    return new Response(response.json)
}