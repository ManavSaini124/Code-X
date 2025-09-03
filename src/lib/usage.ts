import { RateLimiterPrisma } from "rate-limiter-flexible"
import { prisma } from "./db"
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const PRO_POINTS = 100;
const DURATION = 30*24*60*60;
const GENERATION_COST = 1

export async function getUsageTracker(){
    const {has} = await auth();
    const hasPremiumAccess  = has({ plan : "pro" })
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasPremiumAccess ? PRO_POINTS : FREE_POINTS,
        duration: DURATION,// 30 days
    });

    return usageTracker;
}

export async function consumeCredits() {
    
    const { userId } = await auth();
    console.log(userId);
    if(!userId){
        console.log("Not Authenticated");
        throw new Error("Not Authenticated");
    }
    
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
}

export async function getUsageStatus() {
    const { userId } = await auth();
    if(!userId){
        throw new Error("Not Authenticated");
    }
    
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;

}
