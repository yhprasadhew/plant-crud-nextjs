"use server";
import {neon} from '@neondatabase/serverless';

export async function getUserDetails(userId: string) {
    if(!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined in the environment variables.");
    }
    if(!userId) {
        return null;
    }
    const sql = neon(process.env.DATABASE_URL);
    const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return user || null;
}