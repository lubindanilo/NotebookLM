import { getDownloadUrl } from "../api";
import type { FileInfo } from "../types";

interface Props {
  jobId: string;
  files: FileInfo[];
}

const TYPE_ICONS: Record<string, string> = {
  audio: "🎙️",
  video: "🎬",
  cinematic_video: "🎥",
  slides: "📊",
  quiz: "❓",
  flashcards: "🃏",
  mindmap: "🧠",
  infographic: "📈",
  report: "📄",
  study_guide: "📚",
  data_table: "📋",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OutputGallery({ jobId, files }: Props) {
  if (!files.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Downloads</h2>
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.filename} className="flex items-center gap-3 bg-gray-900 rounded-xl p-3">
            <span className="text-2xl">{TYPE_ICONS[f.output_type] || "📦"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{f.filename}</div>
              <div className="text-xs text-gray-500">
                {f.output_type.replace(/_/g, " ")} &middot; {formatSize(f.size)}
              </div>
            </div>
            <a
              href={getDownloadUrl(jobId, f.filename)}
              download={f.filename}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition shrink-0"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
