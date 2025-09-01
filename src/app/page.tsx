"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const Page= ()=> {
  const [value, setValue] = useState("")
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: ()=>{
      toast.success("Message created")
    }
  }))

  return (
    <div className="flex flex-col gap-2">
      <Input value={value} onChange={(e)=> setValue(e.target.value)} />
      <Button
        onClick={()=> createMessage.mutate({ value: value })}
      >
        Invoke
      </Button>

      {JSON.stringify(messages, null, 2)}
    </div>
  )
}  

export default Page
