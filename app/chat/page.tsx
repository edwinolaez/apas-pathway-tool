"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import VoiceInput from "../components/VoiceInput";

interface ProgramCard {
  id: string;
  name: string;
  institution: string;
  credentials: string;
  duration: string;
  tuition: string;
  description: string;
  deliveryMode: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function ChatPageContent() {
  const router = useRouter();
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get("studentId") as Id<"students"> | null;

  const getOrCreateThread = useAction(api.advisorAgent.getOrCreateAdvisorThread);
  const sendAdvisorMessage = useAction(api.advisorAgent.sendAdvisorMessage);
  const searchProgramCards = useAction(api.advisorAgent.searchProgramCards);

  const linkedStudent = useQuery(
    api.students.getStudentByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  const resolvedStudentId = useMemo(() => {
    if (queryStudentId) return queryStudentId;
    if (linkedStudent?._id) return linkedStudent._id;
    return null;
  }, [queryStudentId, linkedStudent?._id]);

  const student = useQuery(
    api.students.getProfile,
    resolvedStudentId ? { studentId: resolvedStudentId } : "skip",
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string>("");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [programCards, setProgramCards] = useState<ProgramCard[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Extract budget from conversation messages
  const parseBudgetFromText = (text: string): number | undefined => {
    const normalized = text.toLowerCase();

    const patterns = [
      /(?:budget|afford|spend|cost|under|below|around|up to|max(?:imum)?).*?\$?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(k)?\b/i,
      /\$\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(k)?\b/i,
      /\b(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(k)\b/i,
      /\b(\d{4,6}(?:,\d{3})*(?:\.\d{1,2})?)\b/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (!match) continue;

      const rawAmount = match[1]?.replace(/,/g, "");
      if (!rawAmount) continue;

      const parsed = Number.parseFloat(rawAmount);
      if (!Number.isFinite(parsed) || parsed <= 0) continue;

      const hasK = !!match[2];
      return hasK ? parsed * 1000 : parsed;
    }

    return undefined;
  };

  const extractBudgetFromMessages = (additionalMessage?: string): number | undefined => {
    // Check additional message first (most recent user input)
    if (additionalMessage) {
      const parsed = parseBudgetFromText(additionalMessage);
      if (parsed !== undefined) return parsed;
    }

    // Then check existing messages from most recent to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== "user") continue;

      const parsed = parseBudgetFromText(msg.content);
      if (parsed !== undefined) return parsed;
    }

    return undefined;
  };

  // If user has no profile, force profile-first flow.
  useEffect(() => {
    if (!userId) return;
    if (queryStudentId) return;
    if (linkedStudent === null) {
      router.replace("/profile");
    }
  }, [userId, queryStudentId, linkedStudent, router]);

  useEffect(() => {
    if (resolvedStudentId) {
      localStorage.setItem("pathrStudentId", String(resolvedStudentId));
    }
  }, [resolvedStudentId]);

  useEffect(() => {
    if (!student?._id || threadId || isBootstrapping) return;

    const initThread = async () => {
      setIsBootstrapping(true);
      try {
        const result = await getOrCreateThread({
          studentId: String(student._id),
        });
        setThreadId(String(result.threadId));
        setMessages([
          {
            id: `assistant-welcome-${Date.now()}`,
            role: "assistant",
            content: result.message,
          },
        ]);
      } catch (err) {
        console.error("Failed to initialize advisor thread", err);
        setMessages([
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: "I could not start the advisor chat yet. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void initThread();
  }, [student?._id, threadId, isBootstrapping, getOrCreateThread]);

  const fetchCardsForQuery = async (
    query: string,
    options?: { notifyOnError?: boolean; maxTuition?: number },
  ): Promise<number> => {
    if (!query.trim()) return 0;
    setIsFetchingCards(true);
    try {
      const cardResults = await searchProgramCards({ 
        query, 
        limit: 6,
        maxTuition: options?.maxTuition,
      });
      setProgramCards(cardResults.cards);
      return cardResults.cards.length;
    } catch (err) {
      console.error("Failed to fetch program cards", err);
      setProgramCards([]);
      if (options?.notifyOnError) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-cards-error-${Date.now()}`,
            role: "assistant",
            content:
              "I could not load program cards right now. Please try again in a moment.",
          },
        ]);
      }
      return 0;
    } finally {
      setIsFetchingCards(false);
    }
  };

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId],
    );
  };

  const handleCompare = () => {
    if (selectedPrograms.length >= 2) {
      router.push(`/compare?programs=${selectedPrograms.join(",")}`);
    }
  };

  const handleSendMessage = async () => {
    const message = chatInput.trim();
    if (!message || !student?._id) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsReplying(true);

    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const init = await getOrCreateThread({ studentId: String(student._id) });
        activeThreadId = String(init.threadId);
        setThreadId(activeThreadId);
      }

      const result = await sendAdvisorMessage({
        threadId: activeThreadId,
        message,
        studentId: String(student._id),
      });

      const safeResponse =
        typeof result.response === "string" && result.response.trim().length > 0
          ? result.response
          : "I understood your request. Click Find Programs and I will fetch matching options based on your latest constraints.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: safeResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Fetch cards with budget constraint if mentioned in this or previous messages
      const budget = extractBudgetFromMessages(message);
      await fetchCardsForQuery(message, { maxTuition: budget });
    } catch (err) {
      console.error("Failed to send advisor message", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "I hit an issue while responding. Please try again.",
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  const handleFindPrograms = async () => {
    if (!student) return;

    const budget = extractBudgetFromMessages();
    
    const query = [
      `Career goal: ${student.careerGoal}`,
      `Interests: ${(student.interests || []).join(", ")}`,
      `Education: ${student.currentEducation}`,
      budget ? `Maximum tuition: $${budget}` : "",
    ].filter(Boolean).join(". ");

    const cardsFound = await fetchCardsForQuery(query, { 
      notifyOnError: true,
      maxTuition: budget,
    });
    
    const budgetMessage = budget 
      ? ` within your budget of $${budget.toLocaleString()}`
      : "";
    
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-find-${Date.now()}`,
        role: "assistant",
        content:
          cardsFound > 0
            ? `Here are ${cardsFound} programs${budgetMessage} based on your profile. You can select cards and compare them.`
            : `I could not find matching program cards${budgetMessage} from your profile right now. Try adding constraints like province, delivery mode, or a specific field (for example: online software programs in Alberta).`,
      },
    ]);
  };

  if (!userId || linkedStudent === undefined || (resolvedStudentId && student === undefined)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading your advisor chat...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Greeting Section */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {student.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Based on your interest in <span className="font-semibold text-accent">{student.interests[0]}</span> and 
            your goal to become a <span className="font-semibold text-accent">{student.careerGoal}</span>, 
            I&apos;m here to help you find the perfect program.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => void handleFindPrograms()}
            disabled={isFetchingCards}
            className="rounded-full border-primary border px-6 py-4 text-sm font-bold text-white bg-primary hover:bg-[#342158] transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isFetchingCards ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Finding...
              </span>
            ) : (
              "Find Programs"
            )}
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-full border-border border-2 px-6 py-4 text-sm font-bold text-foreground bg-card hover:bg-muted transition-colors shadow-lg hover:shadow-xl"
          >
            Edit Profile
          </button>
        </div>

        {/* Chat Messages */}
        <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-border max-h-[48vh] overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {(isReplying || isBootstrapping) && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 text-sm bg-muted text-foreground border border-border inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-accent" />
                <span>Advisor is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Program Cards */}
        {programCards.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Recommended Programs
              </h2>
              {selectedPrograms.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedPrograms.length} selected
                </p>
              )}
            </div>
            <div className="space-y-4">
              {programCards.map((program) => (
                <div
                  key={program.id}
                  className={`bg-card rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                    selectedPrograms.includes(program.id)
                      ? "border-primary bg-muted"
                      : "border-border hover:border-accent"
                  }`}
                  onClick={() => handleProgramToggle(program.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="shrink-0 mt-1">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedPrograms.includes(program.id)
                            ? "bg-primary border-primary"
                            : "border-border bg-card"
                        }`}
                      >
                        {selectedPrograms.includes(program.id) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Program Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {program.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {program.institution}
                          </p>
                        </div>
                        <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                          From RAG
                        </div>
                      </div>
                      <p className="text-foreground mb-3">{program.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-muted text-foreground px-3 py-1 rounded-full text-sm">
                          📜 {program.credentials}
                        </span>
                        <span className="bg-muted text-foreground px-3 py-1 rounded-full text-sm">
                          ⏱️ {program.duration}
                        </span>
                        <span className="bg-muted text-foreground px-3 py-1 rounded-full text-sm">
                          💰 {program.tuition}
                        </span>
                        <span className="bg-muted text-foreground px-3 py-1 rounded-full text-sm">
                          🖥️ {program.deliveryMode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about programs..."
                className="flex-1 px-4 py-3 border-2 border-border rounded-full focus:border-primary focus:outline-none text-base"
              />
              <VoiceInput
                fieldName="Chat"
                onTranscript={(text) => setChatInput(text)}
              />
              <button
                onClick={() => void handleSendMessage()}
                disabled={!chatInput.trim() || isReplying}
                className="rounded-full border-primary border px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-[#342158] transition-colors disabled:opacity-50"
              >
                {isReplying ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Action Button (FAB) for Compare */}
        {selectedPrograms.length >= 2 && (
          <button
            onClick={handleCompare}
            className="fixed bottom-24 right-8 rounded-full border-accent border-2 px-6 py-4 text-sm font-bold text-white bg-accent hover:bg-[#257a69] transition-all shadow-2xl hover:shadow-3xl animate-bounce"
          >
            🔍 Compare {selectedPrograms.length} Programs
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
