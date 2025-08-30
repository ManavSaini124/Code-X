"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const page= ()=> {
  const [value, setValue] = useState("")
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}))

  return (
    <div className="flex flex-col gap-2">
      <Input value={value} onChange={(e)=> setValue(e.target.value)} />
      <Button
        onClick={()=> invoke.mutate({ Value: value })}
      >
        Invoke
      </Button>
    </div>
  )
}

export default page
