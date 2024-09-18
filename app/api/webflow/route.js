import {WebflowClient} from "webflow-api";

export async function GET() {
    const webflow = new WebflowClient({accessToken: '82374dd4c9138ebe6ab42030028def41f96ac5270abf7eb5769d0bdc84c4a8ac'});
    const product = await webflow.products.get('66bc87abb493777bf386db93', '66bc87abb493777bf386dc53');

    return Response.json(product);
}
