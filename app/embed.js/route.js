import {nodeFs} from "next/dist/server/lib/node-fs-methods";
import {NextResponse} from "next/server";

export async function GET() {
    const file = await nodeFs.readFile("app/embed.js/script.js", "utf-8");
    return new NextResponse(file, {
        headers: {
            "Content-Type": "application/javascript",
        },
    });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
