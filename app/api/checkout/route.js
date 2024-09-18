import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(response) {
    // get header from response
    const header = response.headers;
    const body = await response.json();

    const storeId = header.get("X-Wf-Site");
    const {cartItems} = body;

    const store = await prisma.store.findFirst({
        where: {
            webflowSiteId: storeId,
            products: {
                some: {
                    webflowSkuId: {
                        in: cartItems.map((item) => item.sku.id),
                    },
                },
            },
        },
    });

    return new NextResponse(JSON.stringify(store), {
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-Wf-Csrf, X-Wf-Site",
        },
    });
}
