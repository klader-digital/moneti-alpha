'use server'

import {validateRequest} from "@/actions/auth";
import {WebflowClient} from "webflow-api";
import {GET_WEBFLOW_SITE} from "@/lib/webflow";
import {revalidatePath} from "next/cache";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function CREATE_STORE(payload) {
    const {user} = await validateRequest();

    if (!user) {
        throw new Error('User not found');
    }

    const webflow = new WebflowClient({accessToken: payload.webflowApiKey});
    const {id, displayName} = await GET_WEBFLOW_SITE(webflow);

    try {

        const store = await prisma.store.create({
            data: {
                ...payload,
                name: displayName,
                webflowSiteId: id,
                user: {
                    connect: {
                        id: user?.id,
                    },
                },
            },
        });

        const webhooks = [
            'collection_item_created',
            'collection_item_changed',
            'collection_item_deleted',
            'collection_item_unpublished',
        ]

        for (const webhook of webhooks) {
            await webflow.webhooks.create(id, {
                triggerType: webhook,
                url: `https://webhook.site/1ae4c376-57e2-41a4-89a7-77031b97417b`,
            });
        }
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/store');
}

export async function UPDATE_STORE(payload, storeId) {
    const {user} = await validateRequest();

    if (!user) {
        throw new Error('User not found');
    }

    const store = await prisma.store.findFirst({
        where: {
            id: storeId,
            userId: user.id,
        },
    });

    if (!store) {
        throw new Error('Store not found');
    }

    await prisma.store.update({
        where: {
            id: storeId,
        },
        data: {
            enableStripeTestMode: payload.enableStripeTestMode,
            stripeSecretLiveKey: payload.stripeSecretLiveKey,
            stripeSecretTestKey: payload.stripeSecretTestKey,
        },
    });

    revalidatePath(`/dashboard/store/${storeId}/settings`);
}

export async function DELETE_STORE(storeId) {
    const {user} = await validateRequest();

    if (!user) {
        throw new Error('User not found');
    }

    const store = await prisma.store.findFirst({
        where: {
            id: storeId,
            userId: user.id,
        },
    });

    if (!store) {
        throw new Error('Store not found');
    }

    await prisma.store.delete({
        where: {
            id: storeId,
        },
    });

    revalidatePath('/dashboard/store');
}

export async function GET_STORES_BY_USER_ID(userId) {
    const {user} = await validateRequest();

    if (!user || user.id !== userId) {
        throw new Error('User not found');
    }

    return prisma.store.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function GET_STORE_BY_USER_ID_AND_STORE_ID(userId, storeId, include) {
    const {user} = await validateRequest();

    if (!user || user.id !== userId) {
        throw new Error('User not found');
    }

    return prisma.store.findFirst({
        where: {
            id: storeId,
            userId,
        },
        include: {
            ...include,
        },
    });
}
