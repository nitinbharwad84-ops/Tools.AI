import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabaseClient";
import { useAuthStore } from "../stores/authStore";
import { Loader2, Download, Clock, Type, Image as ImageIcon, FileText, Mail, Flame, Video, Trash2, AlertCircle } from "lucide-react";
import { GenerationHistory } from "../types/supabase";
import { ConfirmModal } from "../components/ConfirmModal";

const fetchHistory = async ({ pageParam = 0, userId }: { pageParam: number, userId: string }) => {
  const limit = 10;
  const { data, error } = await supabase
    .from("generation_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(pageParam * limit, (pageParam + 1) * limit - 1);

  if (error) throw error;
  return { data, nextCursor: data.length === limit ? pageParam + 1 : undefined };
};

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case "summarizer": return <FileText className="w-5 h-5 text-blue-500" />;
    case "grammar-fixer": return <Type className="w-5 h-5 text-rose-500" />;
    case "image-gen": return <ImageIcon className="w-5 h-5 text-purple-500" />;
    case "email-pacifier": return <Mail className="w-5 h-5 text-emerald-500" />;
    case "resume-roaster": return <Flame className="w-5 h-5 text-orange-500" />;
    case "video-analyzer": return <Video className="w-5 h-5 text-indigo-500" />;
    default: return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

export const HistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = React.useState(false);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["history", user?.id],
    queryFn: ({ pageParam }) => fetchHistory({ pageParam, userId: user!.id }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("generation_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", user?.id] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("generation_history")
        .delete()
        .eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", user?.id] });
    },
  });

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-bold">Error loading history</p>
        <p className="text-sm opacity-70">{(error as Error).message}</p>
      </div>
    );
  }

  const handleDownload = (item: GenerationHistory) => {
    if (item.output_type === "image") {
      const link = document.createElement("a");
      link.href = item.output;
      link.download = `generated-image-${item.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([item.output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generation-${item.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const isEmpty = data.pages[0].data.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Helmet>
        <title>Generation History | Nexus AI</title>
        <meta name="description" content="View and manage your past AI-generated content with Nexus AI. Easily access, download, or delete your generation history." />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generation History</h1>
        {!isEmpty && (
          <button
            onClick={() => setIsClearAllOpen(true)}
            disabled={clearAllMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
          >
            {clearAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Clear All
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={() => clearAllMutation.mutate()}
        title="Clear All History"
        message="Are you sure you want to delete your entire generation history? This action cannot be undone."
        confirmText="Clear All"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete History Item"
        message="Are you sure you want to delete this item from your history?"
        confirmText="Delete"
        variant="danger"
      />

      <div className="space-y-6">
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((item: GenerationHistory) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      {getToolIcon(item.tool_name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white capitalize">
                        {item.tool_name.replace("-", " ")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Download Output"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-100 focus:opacity-100"
                      title="Delete Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Original Prompt
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                      {item.user_prompt}
                    </p>
                  </div>

                  {item.enhanced_prompt && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Enhanced Prompt
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-primary/5 p-3 rounded-xl border border-primary/10">
                        {item.enhanced_prompt}
                      </p>
                    </div>
                  )}

                  {item.options_selected && Object.keys(item.options_selected as object).length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Options
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.options_selected as object).map(([key, value]) => (
                          <span key={key} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Output
                    </h4>
                    {item.output_type === "image" ? (
                      <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square max-w-sm">
                        <img src={item.output} alt="Generated" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {item.output}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
          </button>
        </div>
      )}
      
      {!hasNextPage && !isEmpty && (
        <p className="text-center text-slate-500 dark:text-slate-400 mt-8 text-sm">
          No more history to load.
        </p>
      )}

      {isEmpty && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No History Yet</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Start using the tools to see your generation history here.
          </p>
        </div>
      )}
    </div>
  );
};
