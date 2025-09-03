import { Sandbox } from "@e2b/code-interpreter"
import { inngest } from "./client";
import {openai, createAgent, createTool, createNetwork, type Tool, type Message, createState} from '@inngest/agent-kit'
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";


interface AgentState {
  summary: string;
  files: {[path: string]: string};
};

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run(
      "get-sandbox-id",
      async()=>{
        const sandbox = await Sandbox.create("code-x-nextjs-2");
        await sandbox.setTimeout(SANDBOX_TIMEOUT)
        return sandbox.sandboxId;
      }
    )

    const previousMessages = await step.run("get-previous-messages", async()=>{
      const formatedMessages:Message[] = [];
      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })

      for(const message of messages){
        formatedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT"? "assistant": "user",
          content: message.content
        })
      }
      return formatedMessages.reverse()
    })

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    )

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "an expert coding agent",
      system: PROMPT,
      model: openai({
        model: 'gpt-4.1',
        defaultParameters:{
          temperature: 0.1,
        }
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'Use the terminal to run commands',
          parameters: z.object({
            command: z.string(),
          }),
          handler: async({ command  }, { step })=>{
            return await step?.run('terminal', async () => {
              const buffers = { stdout: '', stderr: '' };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command,{
                  onStdout:(data : string)=>{
                    buffers.stdout += data;
                  },
                  onStderr:(data : string)=>{
                    buffers.stderr += data;
                  }
                });

                return result.stdout;
              } catch (error) {
                console.error(`Command error: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`);
                return `Command error: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
              }
            })
          }
        }),

        createTool({
          name: `createOrUpdateFiles`,
          description: 'create or update files in sandbox',
          parameters: z.object({
            files: z.array(
              z.object({ 
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async({ files }, { step , network}:Tool.Options<AgentState>)=>{
            const newFile = await step?.run('createOrUpdateFiles', async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for(const file of files){
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles
              } catch (error) {
                return "Error: "+error
              }
            });

            if(typeof newFile === 'object'){
              network.state.data.files = newFile;
            }
          }
        }),

        createTool({
          name: "readFiles",
          description: "Read files from sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async({ files }, { step })=>{
            return await step?.run('readFiles', async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents: {path: string, content: string}[] = [];
                for( const file of files ){
                  const content = await sandbox.files.read(file);
                  contents.push({ path:file,content});
                }
                return JSON.stringify(contents);
              } catch (err) {
                return "Error: "+err
              }
            })
          }
        })
      ],
      lifecycle:{
        onResponse:async({result , network})=>{
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if(lastAssistantMessageText && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      }
    });

    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async({ network }) =>{
        const summary = network.state.data.summary;
        if(summary){
          return ;
        }

        return codeAgent;
      }
    })

    const result = await network.run(event.data.Value, {state: state});

    const fragmentTitleGenrator = createAgent({
      name: "fragment-title-genrator",
      description: "an fragment title genrator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      })
    });

    const responseGenrator = createAgent({
      name: "response-genrator",
      description: "a response genrator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      })
    });

    const {output: fragmentTitleOutput} = await fragmentTitleGenrator.run(result.state.data.summary);
    const {output: responseOutput} = await responseGenrator.run(result.state.data.summary);

    const genrateFragmentTitle = () =>{
      if(fragmentTitleOutput[0].type !== "text"){
        return "fragment"
      }
      if(Array.isArray(fragmentTitleOutput[0].content)){
        return fragmentTitleOutput[0].content.map((txt)=> txt).join('')
      }else{
        return fragmentTitleOutput[0].content
      }
    }

    const genrateResponse = () =>{
      if(responseOutput[0].type !== "text"){
        return "Here You go"
      }
      if(Array.isArray(responseOutput[0].content)){
        return responseOutput[0].content.map((txt)=> txt).join('')
      }else{
        return responseOutput[0].content
      }
    }

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000)

      return `https://${host}`
    })

    await step.run('save-result', async()=>{
      if(isError){
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong . Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          }
        })
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: genrateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: genrateFragmentTitle(),
              files: result.state.data.files
            }, 
          }
        },
      })
    })

    return { 
      url: sandboxUrl ,
      title : 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary
    }
  },
);