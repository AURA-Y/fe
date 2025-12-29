import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";

interface ReferenceMaterialUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const ReferenceMaterialUpload = ({
  files,
  onFileChange,
  onRemoveFile,
}: ReferenceMaterialUploadProps) => {
  return (
    <div className="space-y-3">
      <label className="text-md block font-medium text-slate-700 dark:text-slate-300">
        참고 자료 (선택)
      </label>
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
            <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOCX, TXT (최대 10MB)</p>
          <input type="file" multiple className="hidden" id="file-upload" onChange={onFileChange} />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            파일 선택
          </Button>
        </div>
      </div>

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                onClick={() => onRemoveFile(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferenceMaterialUpload;
