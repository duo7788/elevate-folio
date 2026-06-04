import { Download, Settings2 } from 'lucide-react';

export default function EditToggle({
  isEditing,
  onChange,
  onExport,
}: {
  isEditing: boolean;
  onChange: (val: boolean) => void;
  onExport?: () => void;
}) {
  return (
    <div className="fixed right-6 top-6 z-50 flex items-center gap-3">
      {onExport && (
        <button
          onClick={onExport}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-black/5 p-3 text-xs font-semibold uppercase tracking-wider text-neutral-600 backdrop-blur-md transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
          aria-label="Export Content"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export Content</span>
        </button>
      )}
      <button
        onClick={() => onChange(!isEditing)}
        className={`flex cursor-pointer items-center gap-2 rounded-full border p-3 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all ${
          isEditing
            ? 'bg-blue-500 text-white border-blue-600'
            : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/20'
        }`}
        aria-label="Toggle Edit Mode"
      >
        <Settings2 className="w-5 h-5" />
        <span className="hidden sm:inline">{isEditing ? 'Editing' : 'Edit Mode'}</span>
      </button>
    </div>
  );
}
