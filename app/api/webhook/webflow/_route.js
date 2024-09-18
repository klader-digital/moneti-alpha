import prisma from "@/lib/prisma";
import {WebflowClient} from "webflow-api";
import Stripe from "stripe";

export async function POST(response) {
    try {
        //@ts-expect-error Argument of type 'ReadableStream<any>' is not assignable to parameter of type 'ReadableStream | Readable | AsyncIterable<any>'
        const { triggerType, payload } = await response.json();

        // Validate the payload is a product
        if (!payload.fieldData?.product) {
            return Response.json({ message: 'Webhook received' }, { status: 200 });
        }

        // First, find the store
        const store = await prisma.store.findFirst({ where: { webflowSiteId: payload.siteId } });

        if (!store) {
            return Response.json({ message: 'Store not found' }, { status: 404 });
        }

        // Check if the product exists and if its data is already up-to-date
        const existingProduct = await prisma.product.findFirst({
            where: { webflowSkuId: payload.id },
            select: { updatedAt: true } // assuming you store lastUpdated in your product table
        });

        // Compare lastUpdated timestamp in the payload with the stored lastUpdated
        if (existingProduct && existingProduct.updatedAt && new Date(existingProduct.updatedAt).getTime() >= new Date(payload.lastUpdated).getTime()) {
            return Response.json({ message: 'No update needed, data is up-to-date' }, { status: 200 });
        }

        // Initialize the Webflow client with the store's API key
        const webflow = new WebflowClient({ accessToken: store.webflowApiKey });

        // Fetch the Webflow product
        const webflowProduct = await webflow.products.get(payload.siteId, payload.fieldData.product);

        if (!webflowProduct) {
            return Response.json({ message: 'Product not found' }, { status: 404 });
        }

        const webflowSku = webflowProduct.skus.find(sku => sku.id === payload.id);

        if (!webflowSku) {
            return Response.json({ message: 'SKU not found' }, { status: 404 });
        }

        // CREATE_STRIPE_PRODUCT
        const stripe = new Stripe(store.enableStripeTestMode ? store.stripeSecretTestKey : store.stripeSecretLiveKey);
        let stripeProduct = null;

        try {
            stripeProduct = await stripe.products.retrieve(webflowSku.id);
        } catch (error) {
            stripeProduct = await stripe.products.create({
                id: webflowSku.id,
                name: webflowSku.fieldData.name,
                images: [webflowSku.fieldData?.['main-image']?.url || ''],
                type: 'good',
            });
        }

        // CREATE_STRIPE_PRICE
        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: webflowSku.fieldData?.price?.value,
            currency: webflowSku.fieldData?.price?.unit,
        });

        // CREATE_PRODUCT or UPDATE_PRODUCT
        const product = await prisma.product.upsert({
            where: { webflowSkuId: webflowSku.id },
            update: {
                name: webflowSku.fieldData.name,
                image: webflowSku.fieldData?.['main-image']?.url || '',
                price: webflowSku.fieldData?.price?.value,
                currency: webflowSku.fieldData?.price?.unit,
                stripeProductId: stripeProduct.id,
                stripePriceId: stripePrice.id,
                updatedAt: payload.lastUpdated // store the new lastUpdated timestamp
            },
            create: {
                storeId: store.id,
                name: webflowSku.fieldData.name,
                image: webflowSku.fieldData?.['main-image']?.url || '',
                price: webflowSku.fieldData?.price?.value,
                currency: webflowSku.fieldData?.price?.unit,
                webflowSkuId: webflowSku.id,
                stripeProductId: stripeProduct.id,
                stripePriceId: stripePrice.id,
                updatedAt: payload.lastUpdated // store the lastUpdated timestamp for future checks
            },
        });

        return Response.json({ message: 'Webhook received and processed', product }, { status: 200 });
    } catch (error) {
        return Response.json({ message: error.message || 'An error occurred' }, { status: 500 });
    }
}

// collection_item_created
// collection_item_changed
// collection_item_deleted
// collection_item_unpublished
