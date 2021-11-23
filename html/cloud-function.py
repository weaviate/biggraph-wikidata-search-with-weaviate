import requests

def getQ(request):
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = { 'Access-Control-Allow-Origin': '*' }
    query = request.args.get('q')
    r = requests.get('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' + query + '&format=json&errorformat=plaintext&language=en&uselang=en&type=item')
    return (r.json(), 200, headers)
