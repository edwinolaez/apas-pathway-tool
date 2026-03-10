import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getLatestByStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("advisorThreads")
      .withIndex("by_student_updated", (q) => q.eq("studentId", args.studentId as Id<"students">))
      .order("desc")
      .first();
  },
});

export const getById = query({
  args: {
    threadRefId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadRefId as Id<"advisorThreads">);
  },
});

export const listByStudent = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("advisorThreads")
      .withIndex("by_student_updated", (q) => q.eq("studentId", args.studentId as Id<"students">))
      .order("desc")
      .collect();

    return threads.map((t) => ({
      id: String(t._id),
      title: t.title,
      updatedAt: t.updatedAt,
      lastMessageAt: t.lastMessageAt,
      lastMessagePreview: t.lastMessagePreview ?? "",
    }));
  },
});

export const getMessages = query({
  args: {
    threadRefId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const max = Math.max(1, Math.min(args.limit ?? 50, 100));
    const messages = await ctx.db
      .query("advisorMessages")
      .withIndex("by_thread_created", (q) =>
        q.eq("threadRefId", args.threadRefId as Id<"advisorThreads">)
      )
      .order("desc")
      .take(max);

    return messages
      .reverse()
      .map((m) => ({
        id: String(m._id),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
  },
});

export const createThread = mutation({
  args: {
    studentId: v.string(),
    agentThreadId: v.string(),
    title: v.string(),
    welcomeMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threadId = await ctx.db.insert("advisorThreads", {
      studentId: args.studentId as Id<"students">,
      agentThreadId: args.agentThreadId,
      title: args.title,
      lastMessagePreview: args.welcomeMessage.slice(0, 160),
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    });

    await ctx.db.insert("advisorMessages", {
      threadRefId: threadId,
      role: "assistant",
      content: args.welcomeMessage,
      createdAt: now,
    });

    return String(threadId);
  },
});

export const appendMessage = mutation({
  args: {
    threadRefId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("advisorMessages", {
      threadRefId: args.threadRefId as Id<"advisorThreads">,
      role: args.role,
      content: args.content,
      createdAt: now,
    });

    const thread = await ctx.db.get(args.threadRefId as Id<"advisorThreads">);
    if (thread) {
      await ctx.db.patch(thread._id, {
        updatedAt: now,
        lastMessageAt: now,
        lastMessagePreview: args.content.slice(0, 160),
      });
    }

    return true;
  },
});
