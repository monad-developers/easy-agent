import PythFetcherAgent from "@easyagent/pyth-fetcher"
import { ToolInvocation } from "ai"

export const plugins = [
  PythFetcherAgent
];

export const pluginInterfaces: Record<string, React.ComponentType<{ invocation: ToolInvocation }>> = plugins.reduce((acc, agent) => {
  for (const [key, component] of Object.entries(agent.InterfaceList)) {
    acc[`${agent.AgentName}-${key}`] = component
  }
  return acc
}, {} as Record<string, React.ComponentType<{ invocation: ToolInvocation }>>);