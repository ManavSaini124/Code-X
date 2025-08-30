"use client"

import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";

const page= ()=> {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}))

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={()=> invoke.mutate({ text: "manav" })}
      >
        Invoke
      </Button>
    </div>
  )
}

export default page
