import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Customize basic elements
        p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-emerald-400" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-white border-b border-zinc-700 pb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 text-white mt-6" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 text-zinc-200 mt-4" {...props} />,
        
        // Customize table elements for Workout Plans
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4 rounded-lg border border-zinc-700">
            <table className="w-full text-left text-sm text-zinc-300" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-zinc-800 text-emerald-400 uppercase font-bold" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-zinc-700 bg-zinc-900/50" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-zinc-800/50 transition-colors" {...props} />,
        th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold tracking-wider" {...props} />,
        td: ({ node, ...props }) => <td className="px-4 py-3 whitespace-nowrap" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-zinc-400 my-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
