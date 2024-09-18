import prisma from "@/lib/prisma";
import {WebflowClient} from "webflow-api";
import Stripe from "stripe";

export async function POST(response) {
    try {
        //@ts-expect-error Argument of type 'ReadableStream<any>' is not assignable to parameter of type 'ReadableStream | Readable | AsyncIterable<any>'
        const { triggerType, payload } = await response.json();

        // Validate the payload is a product for relevant actions
        if (!payload.fieldData?.product) {
            return Response.json({ message: 'Webhook received' }, { status: 200 });
        }

        // First, find the store
        const store = await prisma.store.findFirst({ where: { webflowSiteId: payload.siteId } });

        if (!store) {
            return Response.json({ message: 'Store not found' }, { status: 404 });
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

        // Initialize Stripe
        const stripe = new Stripe(store.enableStripeTestMode ? store.stripeSecretTestKey : store.stripeSecretLiveKey);

        // Switch case based on the triggerType
        switch (triggerType) {
            case 'collection_item_created':
                // Logic for creating a product and Stripe entry
                await handleProductCreateOrUpdate({ webflowSku, stripe, store, payload });
                break;

            case 'collection_item_changed':
                // Logic for updating an existing product
                await handleProductCreateOrUpdate({ webflowSku, stripe, store, payload });
                break;

            case 'collection_item_deleted':
                // Logic for handling product deletion
                // await handleProductDeletion({ webflowSku, stripe, store });
                break;

            case 'collection_item_unpublished':
                // Logic for handling unpublishing (can reuse deletion logic if appropriate)
                // await handleProductUnpublish({ webflowSku, stripe, store });
                break;

            default:
                return Response.json({ message: 'Unsupported trigger type' }, { status: 400 });
        }

        return Response.json({ message: 'Webhook received and processed' }, { status: 200 });
    } catch (error) {
        return Response.json({ message: error.message || 'An error occurred' }, { status: 500 });
    }
}

// Helper function to handle create or update
async function handleProductCreateOrUpdate({ webflowSku, stripe, store, payload }) {
    // Check if the product exists and if its data is already up-to-date
    const existingProduct = await prisma.product.findFirst({
        where: { webflowSkuId: webflowSku.id },
        select: { updatedAt: true }
    });

    if (existingProduct && existingProduct.updatedAt && new Date(existingProduct.updatedAt).getTime() >= new Date(payload.lastUpdated).getTime()) {
        throw new Error('Product is already up-to-date');
    }

    // CREATE_STRIPE_PRODUCT
    let stripeProduct = null;
    try {
        stripeProduct = await stripe.products.retrieve(webflowSku.id);
    } catch {
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

    // CREATE or UPDATE the product in the database
    await prisma.product.upsert({
        where: { webflowSkuId: webflowSku.id },
        update: {
            name: webflowSku.fieldData.name,
            image: webflowSku.fieldData?.['main-image']?.url || '',
            price: webflowSku.fieldData?.price?.value,
            currency: webflowSku.fieldData?.price?.unit,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
            updatedAt: payload.lastUpdated
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
            updatedAt: payload.lastUpdated
        },
    });
}

// Helper function for deletion
async function handleProductDeletion({ webflowSku, stripe, store }) {
    await prisma.product.delete({
        where: { webflowSkuId: webflowSku.id },
    });
}

// Helper function for unpublish (if distinct from delete)
async function handleProductUnpublish({ webflowSku, stripe, store }) {
    // Logic specific to unpublishing, if needed
}
