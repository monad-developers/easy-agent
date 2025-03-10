import { ZodObject, ZodRawShape, z } from "zod"
import type { ToolInvocation } from "@ai-sdk/ui-utils";
import { Tool, tool } from "ai"
import { hookSystem } from "./HookSystem";
import { World } from "./World";
import React from "react";

export type AdditionalContext = {
  traceID: string,
}

export function action<T extends ZodRawShape>(description: string, context: {
  parametersSchema?: ZodObject<T>
} = {}) {
  let { parametersSchema } = context
  parametersSchema = parametersSchema || z.object({} as T).describe("not needed")
  return function (
    target: any,
    context: ClassMethodDecoratorContext<any, any>
  ) {
    const originalMethod = context.kind === 'method' ? target : undefined;
    if (!originalMethod) {
      throw new Error('@action can only be used on methods');
    }

    // Replace the original method with a wrapped version that includes validation
    function replacementMethod(this: any, ...args: any[]) {
      // Validate parameters using Zod if schema exists and args are provided
      args.length && parametersSchema ? parametersSchema.parse(args[0]) : undefined;
      return originalMethod.call(this, ...args);
    }

    // Store metadata about the action
    context.addInitializer(function () {
      if (!this.__actions) {
        this.__actions = new Map();
      }

      this.__actions.set(context.name.toString(), {
        description,
        parametersSchema,
        method: replacementMethod
      });
    });

    return replacementMethod;
  };
}

export abstract class BaseAgent {
  public static AgentName: string = "unknown";
  constructor(public world: World) { }
  public static InterfaceList: Record<string, React.ComponentType<{ invocation: ToolInvocation }>> = {};

  public async setup(context: any, parameters: any) { };

  get hooks() {
    return hookSystem
  }

  /**
   * Register tools built by this agent
   */
  public registerTools() {
    hookSystem.register('onToolBuild', (tools, context) => {
      return Object.assign(tools, this.toTools(context.traceID))
    })
  }

  public toTools(traceID: string) {
    const tools: { [key: string]: any } = {};
    const actions: Map<string, { description: string, parametersSchema: ZodObject<any>, method: any }> = (this as any).__actions;
    const self = this

    // @ts-ignore
    const AgentName = this.constructor.AgentName

    // Filter for methods that are marked as actions
    for (const [name, { description, parametersSchema, method }] of actions.entries()) {
      if (typeof method === 'function') {
        tools[`${AgentName}-${name}`] = tool({
          description,
          parameters: parametersSchema,
          execute: (args, context) => {
            return method.call(self, args, context, {
              traceID
            });
          },
        });
      }
    }

    return tools;
  }

}