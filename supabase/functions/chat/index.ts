import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task on the user's Kanban board.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          status: { type: "string", enum: ["todo", "in_progress", "done"], description: "Task status column" },
          priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Task priority" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
          labels: { type: "array", items: { type: "string" }, description: "Labels like Bug, Feature, Design, Backend, Frontend, Documentation, Testing, DevOps" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update an existing task. Identify the task by its current title.",
      parameters: {
        type: "object",
        properties: {
          current_title: { type: "string", description: "The current title of the task to update" },
          title: { type: "string", description: "New title" },
          description: { type: "string", description: "New description" },
          status: { type: "string", enum: ["todo", "in_progress", "done"], description: "New status" },
          priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "New priority" },
          due_date: { type: "string", description: "New due date in YYYY-MM-DD format" },
          labels: { type: "array", items: { type: "string" }, description: "New labels" },
        },
        required: ["current_title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_task",
      description: "Delete a task from the board by its title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the task to delete" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
];

async function executeTool(supabase: any, name: string, args: any): Promise<string> {
  if (name === "create_task") {
    // Get max position for the target status
    const status = args.status || "todo";
    const { data: existing } = await supabase
      .from("tasks")
      .select("position")
      .eq("status", status)
      .order("position", { ascending: false })
      .limit(1);
    const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: args.title,
        description: args.description || "",
        status,
        priority: args.priority || "medium",
        due_date: args.due_date || null,
        labels: args.labels || [],
        position,
      })
      .select()
      .single();

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, task: data });
  }

  if (name === "update_task") {
    // Find the task by current title
    const { data: found } = await supabase
      .from("tasks")
      .select("id")
      .ilike("title", args.current_title)
      .limit(1);

    if (!found || found.length === 0) {
      return JSON.stringify({ success: false, error: `Task "${args.current_title}" not found` });
    }

    const updates: any = {};
    if (args.title) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status) updates.status = args.status;
    if (args.priority) updates.priority = args.priority;
    if (args.due_date !== undefined) updates.due_date = args.due_date;
    if (args.labels) updates.labels = args.labels;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", found[0].id)
      .select()
      .single();

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, task: data });
  }

  if (name === "delete_task") {
    const { data: found } = await supabase
      .from("tasks")
      .select("id")
      .ilike("title", args.title)
      .limit(1);

    if (!found || found.length === 0) {
      return JSON.stringify({ success: false, error: `Task "${args.title}" not found` });
    }

    const { error } = await supabase.from("tasks").delete().eq("id", found[0].id);
    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, deleted: args.title });
  }

  return JSON.stringify({ success: false, error: "Unknown tool" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, description, status, priority, due_date, labels")
      .order("position", { ascending: true });

    const taskContext = tasks && tasks.length > 0
      ? `\n\nHere are the user's current tasks on their board:\n${tasks.map((t: any, i: number) =>
          `${i + 1}. "${t.title}" — Status: ${t.status}, Priority: ${t.priority}${t.description ? `, Description: ${t.description}` : ""}${t.due_date ? `, Due: ${t.due_date}` : ""}${t.labels?.length ? `, Labels: ${t.labels.join(", ")}` : ""}`
        ).join("\n")}`
      : "\n\nThe user currently has no tasks on their board.";

    const systemPrompt = `You are FlowBoard AI, a helpful assistant integrated into a Kanban board app called FlowBoard. You have full access to the user's task board and can see all their tasks. You can create, update, and delete tasks using the provided tools. You help users with productivity tips, task planning, project management advice, and answer questions about their tasks. Keep responses concise, friendly, and actionable. Use markdown formatting when helpful. When the user asks you to create or modify tasks, use the tools — don't just describe what to do.${taskContext}`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // First call — may return tool calls (non-streaming)
    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools,
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await firstResponse.text();
      console.error("AI gateway error:", firstResponse.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstResult = await firstResponse.json();
    const choice = firstResult.choices?.[0];

    // If no tool calls, stream a normal response
    if (!choice?.message?.tool_calls || choice.message.tool_calls.length === 0) {
      // Re-do as streaming for a smooth UX
      const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: true,
        }),
      });

      return new Response(streamResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Execute tool calls
    const toolCalls = choice.message.tool_calls;
    const toolResults: any[] = [];
    const executedActions: any[] = [];

    for (const tc of toolCalls) {
      const args = JSON.parse(tc.function.arguments);
      const result = await executeTool(supabase, tc.function.name, args);
      toolResults.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
      executedActions.push({ name: tc.function.name, args, result: JSON.parse(result) });
    }

    // Second call with tool results — stream the final response
    const followUpMessages = [
      ...aiMessages,
      choice.message,
      ...toolResults,
    ];

    const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: followUpMessages,
        stream: true,
      }),
    });

    // Prepend a custom SSE event so the client knows tasks changed
    const actionEvent = `data: ${JSON.stringify({ tasks_changed: true, actions: executedActions })}\n\n`;
    const encoder = new TextEncoder();
    const actionChunk = encoder.encode(actionEvent);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      await writer.write(actionChunk);
      const reader = finalResponse.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value);
      }
      await writer.close();
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
