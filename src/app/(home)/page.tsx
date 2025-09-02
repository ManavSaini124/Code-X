// "use client"

import { ProjectForm } from "@/modules/home/ui/components/project-form"
import { ProjectsList } from "@/modules/home/ui/components/projects-list"
import Image from "next/image"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input";
// import { useTRPC } from "@/trpc/client"
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { toast } from "sonner";

const Page= ()=> {
  // const router = useRouter();
  // const [value, setValue] = useState("")
  // const trpc = useTRPC();
  // const createProject = useMutation(trpc.projects.create.mutationOptions({
  //   onError: (error) => {
  //     toast.error(error.message)
  //   },
  //   onSuccess: (data) => {
  //     router.push(`/projects/${data.id}`)
  //   }
  // }))

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.svg"
            alt="Code-X"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="test-2xl md:text-5xl font-bold text-center">
            Make anything you dream with X
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
            Create apps and sites with the power of AI in minutes with Code-X
        </p>
        <div>
          <div className = "max-w-3xl mx-auto w-full">
            <ProjectForm />
          </div>
        </div>
      </section>
      <ProjectsList />
    </div>
  )
}  

export default Page
