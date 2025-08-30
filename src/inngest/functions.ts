import { Sandbox } from "@e2b/code-interpreter"
import { inngest } from "./client";
import {openai, createAgent} from '@inngest/agent-kit'
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run(
      "get-sandbox-id",
      async()=>{
        const sandbox = await Sandbox.create("code-x-nextjs-2");
        return sandbox.sandboxId;
      }
    )

    const codeAgent = createAgent({
      name: "code-agent",
      system: 'You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & react sinippet , You just return snippit nothing extra',
      model: openai({model: 'gpt-4o'})
    });

    const { output } = await codeAgent.run(
      `Write the folowing snippet: ${event.data.Value}`
    )

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000)

      return `https://${host}`
    })

    return { output, sandboxUrl }
  },
);