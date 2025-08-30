
import {  getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";
const page= async()=> {
  const quearyClient = getQueryClient();
  void quearyClient.prefetchQuery(trpc.create.queryOptions({text:"Manav Prefetch"}));
  // const trpc = useTRPC();
  // const { data } = useQuery(trpc.create.queryOptions({text:"Manav"})); // similar to => api/trpc/body={"text":"Manav"}
  return (
    <HydrationBoundary state={dehydrate(quearyClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  )
}

export default page
