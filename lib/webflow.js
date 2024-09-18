export async function GET_WEBFLOW_SITE(webflow) {
    const {sites} = await webflow.sites.list();

    if (!sites || sites.length === 0) {
        throw new Error('No sites found');
    }

    return sites.pop();
}
