import React, { useState } from "react";
import { useProcessVediPDFMutation } from "../../redux/features/api/api";
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const VediPDFProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processVediPDF, { isLoading, error, data }] =
    useProcessVediPDFMutation();

  const handleFileSelect = (file) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleProcessPDF = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      await processVediPDF(formData).unwrap();
    } catch (err) {
      console.error("Failed to process PDF:", err);
    }
  };

  const handleDownloadResults = () => {
    if (!data?.results) return;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vedi-extraction-results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatParameterName = (param) => {
    return param
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatResponse = (rawResponse) => {
    if (!rawResponse) return "";

    // Remove "assistant:" prefix and clean up the response
    let cleaned = rawResponse
      .replace(/^assistant:\s*/i, "")
      .replace(/^bot:\s*/i, "")
      .replace(/^ai:\s*/i, "")
      .trim();

    // Split into lines and format
    const lines = cleaned.split("\n").filter((line) => line.trim());

    return lines;
  };

  const getStatusIcon = (status) => {
    if (status === 200)
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="w-full p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Design Parameters
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Upload your design document PDF and extract key design parameters
          automatically using advanced AI processing
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Upload Design Document
          </h2>
          <p className="text-gray-600 text-lg">
            Drag and drop your PDF file or click to browse from your computer
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
              : selectedFile
              ? "border-green-500 bg-green-50 shadow-md"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full inline-block">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  Drop your PDF here
                </p>
                <p className="text-gray-600 mb-4">or click to browse files</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Browse Files
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        {selectedFile && (
          <div className="text-center mt-8">
            <button
              onClick={handleProcessPDF}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing PDF...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 mr-3" />
                  Extract Design Parameters
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Processing Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error?.data?.message ||
                  error?.error ||
                  "An error occurred while processing the PDF"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {data && data.success && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Extracted Design Parameters
              </h2>
            </div>
            <button
              onClick={handleDownloadResults}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Results
            </button>
          </div>

          {/* Processing Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Knowledge Base
              </h3>
              <p
                className={`text-xl font-bold ${
                  data.steps?.create_knowledge_base === 200
                    ? "text-blue-600"
                    : "text-red-500"
                }`}
              >
                {data.steps?.create_knowledge_base === 200
                  ? "✓ Created"
                  : "✗ Failed"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200 shadow-sm">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                Workflow App
              </h3>
              <p
                className={`text-xl font-bold ${
                  data.steps?.create_workflow_app === 200
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {data.steps?.create_workflow_app === 200
                  ? "✓ Created"
                  : "✗ Failed"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-purple-800 mb-1">
                Parameters Extracted
              </h3>
              <p className="text-xl font-bold text-purple-600">
                {data.results?.length || 0}
              </p>
            </div>
          </div>

          {/* Extracted Parameters */}
          <div className="space-y-6">
            {data.results?.map((result, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                  result.error
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100"
                    : "border-green-200 bg-gradient-to-br from-green-50 to-green-100"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          result.error ? "bg-red-400" : "bg-green-400"
                        }`}
                      ></div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {formatParameterName(result.parameter)}
                      </h3>
                    </div>

                    {result.error ? (
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          ❌ Error: {result.error}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.raw && (
                          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                Extracted Information
                              </span>
                            </div>

                            {formatResponse(result.raw).map(
                              (line, lineIndex) => (
                                <div key={lineIndex} className="mb-2 last:mb-0">
                                  {line.startsWith("-") ||
                                  line.startsWith("•") ? (
                                    <div className="flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">
                                        •
                                      </span>
                                      <p className="text-gray-700 leading-relaxed">
                                        {line.replace(/^[-•]\s*/, "")}
                                      </p>
                                    </div>
                                  ) : line.includes(":") ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                                      <span className="font-medium text-gray-800 min-w-fit">
                                        {line.split(":")[0]}:
                                      </span>
                                      <span className="text-gray-700">
                                        {line
                                          .split(":")
                                          .slice(1)
                                          .join(":")
                                          .trim()}
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-gray-700 leading-relaxed py-1">
                                      {line}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    {result.error ? (
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="w-6 h-6" />
                        <span className="text-sm font-medium">Failed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-sm font-medium">Success</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Knowledge Base:</span>{" "}
                {data.knowledge_base_name}
              </div>
              <div>
                <span className="font-medium">Chatbot Name:</span>{" "}
                {data.chatbot_name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VediPDFProcessor;
