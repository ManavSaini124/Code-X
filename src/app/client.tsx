"use client"

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Client=() =>{
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(trpc.create.queryOptions({text:"Manav Prefetch"}))

    return (
        <div>
            <h1>{JSON.stringify(data)}</h1>
        </div>
    )
}