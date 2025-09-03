"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    points: number,
    msBeforeNext: number;
}

export function Usage({points, msBeforeNext}: Props) {
    const {has} = useAuth();
    const hasPremiumAccess  = has?.({ plan : "pro" });
    const resetTime = useMemo(()=>{
        try {
            intervalToDuration({
                start: new Date(),
                end: new Date( Date.now() + msBeforeNext)
            }),
            { format: ["months","days","hours"] }
        } catch (error) {
            console.error("ERROR Formating duration", error);
            return "";
        }
    },[msBeforeNext])
    
    return(
        <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
            <div className="flex items-center gap-x-2">
                <div>
                    <p className="text-sm">
                        {points} credits remaining
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Resets in{" "} {resetTime}
                    </p>
                </div>
                {!hasPremiumAccess && (
                    <Button
                        asChild
                        size = "sm"
                        variant={"tertiary"}
                        className="ml-auto"
                    >
                        <Link href="/pricing">
                            <CrownIcon /> Upgrade
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}

