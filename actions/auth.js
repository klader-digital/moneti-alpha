"use server";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {hash, verify} from "@node-rs/argon2";
import {cache} from "react";
import {lucia} from "@/lib/lucia";
import prisma from "@/lib/prisma";
import {generateIdFromEntropySize} from "lucia";

export const validateRequest = cache(async () => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    const result = await lucia.validateSession(sessionId);
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
    } catch {
        // next.js throws when you attempt to set cookie when rendering page
    }
    return result;
});

async function validateEmailAndPassword(formData) {
    const email = formData.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
        typeof email !== "string" ||
        email.length < 3 ||
        email.length > 31 ||
        !emailRegex.test(email)
    ) {
        return {
            error: "Invalid email",
        };
    }

    const password = formData.password;
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return {
            error: "Invalid password",
        };
    }

    return {email, password};
}

async function createSessionAndSetCookie(userId) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

export async function login(formData) {
    const {email, password, error} = await validateEmailAndPassword(formData);

    if (error) {
        throw new Error(error);
    }

    const existingUser = await prisma.user.findUnique({
        where: {email: email.toLowerCase()},
    });

    if (!existingUser) {
        throw new Error("Invalid email or password");
    }

    const validPassword = await verify(existingUser.password_hash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });

    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    await createSessionAndSetCookie(existingUser.id);
    return redirect("/dashboard");
}

export async function register(formData) {
    const {email, password, error} = await validateEmailAndPassword(formData);

    if (error) {
        throw new Error(error);
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {email: email.toLowerCase()},
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    await prisma.user.create({
        data: {
            id: userId,
            email: email.toLowerCase(),
            password_hash: passwordHash,
        },
    });

    await createSessionAndSetCookie(userId);
    return redirect("/dashboard");
}

export async function logout() {
    const {session} = await validateRequest();
    if (!session) {
        return {
            error: "Unauthorized",
        };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
    redirect("/");
}
