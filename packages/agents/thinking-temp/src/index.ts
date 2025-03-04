import { action, AdditionalContext, BaseAgent, messagesToLines, World } from "@easyagent/lib"
import { generateText, ToolExecutionOptions } from "ai"
import { z } from "zod"
import { Thinking } from "./components/ui-thinking"

export const ParametersSchema = z.object({
  uuid: z.string().describe("你当前的对话ID"),
})

export class ThinkingAgent extends BaseAgent {
  static override AgentName = "thinking"

  public async setup(context: any, parameters: any): Promise<void> {
    // setup prompt
    this.hooks.register('onSystemPromptBuild', (systemPrompt) => {
      return systemPrompt + `Your workflow is as follows: when you receive a message, you MUST to call thinking-think function at first.but you don't need to output anything like i am thinking, or i need to thinking.`
    })
    this.registerTools()
  }
  
  static override InterfaceList = {
    think: Thinking
  }

  @action("call this function to get think data")
  public async think(args: {}, { messages }: ToolExecutionOptions, { traceID }: AdditionalContext) {
    const area = this.world.getArea(traceID)
    // 你是一个智能助手的核心部分，大脑，你需要做的事情是对用户的内容进行类似内心想法的分析，并且根据你的分析给出回答。你需要了解用户的意图，了解问题的核心，并且根据内容分步骤解析，你需要输出你思考的所有内容，并且，你的数学能力并不强，所以在思考的时候，你需要仔细的分析问题。
    const result = await generateText({
      model: area.content?.model!,
      experimental_telemetry: area.content?.experimental_telemetry,
      toolChoice: "none",
      prompt: `You are the core part of an intelligent assistant, the brain. Your task is to analyze user content in a way similar to internal thoughts and provide answers based on your analysis. You need to understand the user's intention, grasp the core of the question, and parse the content step by step. You need to output all your thoughts, and also, your mathematical ability is not strong, so when thinking, you need to carefully analyze the problem.

Last messages:
${messagesToLines(messages).join("\n")}
`
    })
    return result.text
  }
}

export default ThinkingAgent