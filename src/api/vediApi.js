// Vedi API Service for AI-powered file processing and queries
import { vediConfig, getEndpointUrl } from "../config/vediConfig";

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage =
        errorData.message || errorData.error || "API request failed";
    } catch {
      errorMessage =
        errorText || `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// File upload to Vedi API
export const uploadFileToVedi = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), vediConfig.timeout);

    // Try proxy first, then fallback to direct URL
    let response;
    try {
      response = await fetch(getEndpointUrl(vediConfig.uploadEndpoint), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } catch (proxyError) {
      console.warn("Proxy failed, trying direct URL:", proxyError);
      // Fallback to direct URL if enabled
      if (vediConfig.fallbackToDirect) {
        response = await fetch("https://oauth1.askmantu.com/vedi/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } else {
        throw proxyError;
      }
    }

    clearTimeout(timeoutId);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
};

// Query Vedi API with natural language questions
export const queryVedi = async (query) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), vediConfig.timeout);

    // Try proxy first, then fallback to direct URL
    let response;
    try {
      response = await fetch(getEndpointUrl(vediConfig.queryEndpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });
    } catch (proxyError) {
      console.warn("Proxy failed, trying direct URL:", proxyError);
      // Fallback to direct URL if enabled
      if (vediConfig.fallbackToDirect) {
        response = await fetch("https://oauth1.askmantu.com/vedi/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: query.trim() }),
          signal: controller.signal,
        });
      } else {
        throw proxyError;
      }
    }

    clearTimeout(timeoutId);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
};

// Batch query multiple questions
export const batchQueryVedi = async (queries) => {
  const results = [];

  for (const query of queries) {
    try {
      const result = await queryVedi(query);
      results.push({
        query,
        success: true,
        response: result.response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      results.push({
        query,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Add small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
};

// Predefined queries for common architectural information
export const commonQueries = {
  roomInfo: [
    "Give me the room names and their respective areas",
    "What are the dimensions of each room?",
    "List all room types and their sizes",
    "What is the total floor area?",
    "Show me the room layout and dimensions",
  ],
  materialInfo: [
    "What materials are used for walls?",
    "List the door and window specifications",
    "What are the flooring materials?",
    "Show me the ceiling specifications",
    "What electrical fixtures are present?",
  ],
  structuralInfo: [
    "What is the building structure type?",
    "List the column and beam specifications",
    "What are the foundation details?",
    "Show me the structural load calculations",
    "What are the seismic considerations?",
  ],
};

// Utility function to format query responses
export const formatQueryResponse = (response) => {
  if (!response) return "";

  // Try to parse and format the response if it's structured
  try {
    // If response contains numbered lists, format them nicely
    if (response.includes("1.")) {
      return response
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");
    }

    // If response contains measurements, format them
    if (
      response.includes("x") ||
      response.includes("WIDE") ||
      response.includes("ft") ||
      response.includes("m")
    ) {
      return response
        .replace(/(\d+x\d+)/g, "**$1**")
        .replace(/(\d+\s+WIDE)/g, "**$1**")
        .replace(/(\d+'-?\d*"x\d+'-?\d*")/g, "**$1**");
    }

    return response;
  } catch {
    return response;
  }
};

// Export configuration for external use
export { vediConfig } from "../config/vediConfig";
