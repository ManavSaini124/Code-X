import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const messagesRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1,{message: "Message is required"})
                    .max(1000,{message: "Message is too long"}),
                projectId: z.string()
                    .min(1,{message: "Project id is required"}),
            }),
        )
        .mutation(async({input, ctx})=>{
            const existingProjects = await prisma.project.findUnique({
                where:{
                    id: input.projectId,
                    userId: ctx.auth.userId
                }
            })

            if(!existingProjects){
                throw new TRPCError
                ({
                    code: "NOT_FOUND",
                    message: "Project not found"
                })
            }

            try{
                await consumeCredits();
            }catch(e){
                if(e instanceof Error){
                    console.log(e);
                    // something else failed
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Something went wrong"
                    })   
                } else {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "Credits exusted"
                    })
                }
            }
            const createdMessage = await prisma.message.create({
                data:{
                    projectId: existingProjects.id,
                    content: input.value,
                    role: "USER",
                    type: "RESULT"
                }
            })

            await inngest.send({
                name: "code-agent/run",
                data: {
                    Value: input.value,
                    projectId: input.projectId,
                }
            });

            return createdMessage;
        }),

    getMany: protectedProcedure
        .input(
            z.object({
                projectId: z.string()
                    .min(1,{message: "Project id is required"}),
            }),
        )
        .query(async({input, ctx})=>{
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId,
                    project:{
                        userId: ctx.auth.userId
                    }
                },
                include: {
                    fragment: true
                },
                orderBy:{
                    updatedAt: 'asc',
                },
                
            })
            
            return messages;
        })
});