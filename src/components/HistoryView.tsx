import React from 'react';
import { motion } from 'motion/react';
import { Clock, Trash2, ArrowLeft, Image as ImageIcon, FileText, Video, Mail, Type, Flame } from 'lucide-react';
import { useHistory, HistoryItem } from '../context/HistoryContext';

interface HistoryViewProps {
  onBack: () => void;
}

const getToolIcon = (tool: string) => {
  switch (tool) {
    case 'summarizer': return <FileText className="w-5 h-5 text-blue-500" />;
    case 'social-gen': return <ImageIcon className="w-5 h-5 text-pink-500" />;
    case 'image-gen': return <ImageIcon className="w-5 h-5 text-purple-500" />;
    case 'grammar-fixer': return <Type className="w-5 h-5 text-green-500" />;
    case 'video-analyzer': return <Video className="w-5 h-5 text-indigo-500" />;
    case 'email-pacifier': return <Mail className="w-5 h-5 text-teal-500" />;
    case 'resume-roaster': return <Flame className="w-5 h-5 text-orange-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const getToolName = (tool: string) => {
  return tool.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const { history, clearHistory, deleteHistoryItem } = useHistory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Activity History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">View your past generations and analyses</p>
          </div>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No history yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Your generated content will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative group"
            >
              <button 
                onClick={() => deleteHistoryItem(item.id)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  {getToolIcon(item.tool)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{getToolName(item.tool)}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {item.input && (
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Input</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.input}</p>
                </div>
              )}

              {item.output && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 block">Output</span>
                  {typeof item.output === 'string' && item.output.startsWith('http') ? (
                    <img src={item.output} alt="Generated" className="h-32 rounded-lg object-cover" />
                  ) : typeof item.output === 'string' ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 whitespace-pre-wrap">{item.output}</p>
                  ) : Array.isArray(item.output) ? (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {item.output.map((out, i) => (
                        typeof out === 'string' && out.startsWith('http') ? (
                          <img key={i} src={out} alt="Generated" className="h-24 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div key={i} className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg min-w-[200px]">{out}</div>
                        )
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      {JSON.stringify(item.output, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
