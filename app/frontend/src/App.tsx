import { useState } from "react";
import AuthStatus from "./components/AuthStatus";
import SourceInput from "./components/SourceInput";
import OutputTypeSelector from "./components/OutputTypeSelector";
import JobStatusPanel from "./components/JobStatus";
import OutputGallery from "./components/OutputGallery";
import { generate } from "./api";
import type { SourceInput as SourceInputType, OutputConfig, OutputType, JobStatus } from "./types";

export default function App() {
  const [sources, setSources] = useState<SourceInputType[]>([]);
  const [selectedOutputs, setSelectedOutputs] = useState<Map<OutputType, OutputConfig>>(new Map());
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = sources.length > 0 && selectedOutputs.size > 0 && !loading;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setJobStatus(null);
    try {
      const outputs = Array.from(selectedOutputs.values());
      const result = await generate(sources, outputs);
      setJobId(result.job_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSources([]);
    setSelectedOutputs(new Map());
    setJobId(null);
    setJobStatus(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NotebookLM Forge</h1>
          <p className="text-sm text-gray-500">Transform any content into any format</p>
        </div>
        <AuthStatus />
      </header>

      {/* Input Section */}
      <section className="space-y-6">
        <SourceInput sources={sources} onChange={setSources} />
        <OutputTypeSelector selected={selectedOutputs} onChange={setSelectedOutputs} />
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`px-6 py-2.5 rounded-xl font-medium transition text-sm
            ${canGenerate
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
        >
          {loading ? "Starting..." : "Generate"}
        </button>
        {jobId && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-sm text-gray-400 transition"
          >
            New session
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results Section */}
      {jobId && (
        <section className="space-y-6 border-t border-gray-800 pt-6">
          <JobStatusPanel jobId={jobId} jobStatus={jobStatus} onUpdate={setJobStatus} />
          {jobStatus && <OutputGallery jobId={jobId} files={jobStatus.files} />}
        </section>
      )}
    </div>
  );
}
