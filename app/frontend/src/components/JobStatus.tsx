import { useEffect, useRef } from "react";
import { getJobStatus } from "../api";
import type { JobStatus as JobStatusType } from "../types";

interface Props {
  jobId: string | null;
  jobStatus: JobStatusType | null;
  onUpdate: (status: JobStatusType) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-600",
  adding_sources: "bg-yellow-600",
  generating: "bg-blue-600",
  waiting: "bg-blue-500",
  downloading: "bg-purple-600",
  completed: "bg-green-600",
  failed: "bg-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  adding_sources: "Adding sources...",
  generating: "Generating...",
  waiting: "Processing...",
  downloading: "Downloading...",
  completed: "Completed",
  failed: "Failed",
};

export default function JobStatus({ jobId, jobStatus, onUpdate }: Props) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const status = await getJobStatus(jobId);
        onUpdate(status);
        if (status.status === "completed" || status.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // ignore poll errors
      }
    };

    poll();
    intervalRef.current = window.setInterval(poll, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId]);

  if (!jobId || !jobStatus) return null;

  const isTerminal = jobStatus.status === "completed" || jobStatus.status === "failed";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Status</h2>
        {jobStatus.elapsed != null && (
          <span className="text-xs text-gray-500">{jobStatus.elapsed}s elapsed</span>
        )}
      </div>

      {/* Overall status */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[jobStatus.status] || "bg-gray-600"}`}>
          {STATUS_LABELS[jobStatus.status] || jobStatus.status}
        </span>
        {!isTerminal && (
          <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {jobStatus.error && (
        <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-sm text-red-300">
          {jobStatus.error}
        </div>
      )}

      {/* Per-output progress */}
      <div className="space-y-1">
        {Object.entries(jobStatus.progress).map(([type, status]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[status] || (status.startsWith("failed") ? "bg-red-600" : "bg-gray-600")}`} />
            <span className="text-gray-300 capitalize">{type.replace(/_/g, " ")}</span>
            <span className="text-gray-500 text-xs">
              {status.startsWith("failed") ? status : STATUS_LABELS[status] || status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
