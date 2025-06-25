import React from "react";
import jsPDF from "jspdf";

// Helper function to add a section with a title and content to the PDF.
const addSection = (
  doc,
  title,
  contentRows,
  startY,
  pageWidth,
  margin,
  lineHeight
) => {
  let y = startY;

  // Section Title
  doc.setFillColor(240, 240, 240); // Light gray background for section title
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51); // Dark gray text
  doc.text(title, margin + 2, y + 6);
  y += 10;

  // Optional Headers for "Input Data" and "Calculation Result"
  if (title === "CALCULATION INPUT DATA" || title === "CALCULATION RESULT") {
    const col1Width = (pageWidth - 2 * margin) * 0.4;
    const col2Width = (pageWidth - 2 * margin) * 0.3;
    const col3Width = (pageWidth - 2 * margin) * 0.15;
    const col4Width = (pageWidth - 2 * margin) * 0.15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0); // Black text for headers

    doc.text("FACTOR", margin + 2, y);
    doc.text("VALUE", margin + col1Width + 2, y);
    doc.text("UNIT", margin + col1Width + col2Width + 2, y);
    doc.text("CODAL REF", margin + col1Width + col2Width + col3Width + 2, y);
    y += lineHeight;
  }

  // Section Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // Black text for content

  contentRows.forEach((row) => {
    const [label, value, unit = "", codalRef = ""] = row;
    doc.text(label, margin + 2, y);
    doc.text(String(value), margin + (pageWidth - 2 * margin) * 0.4 + 2, y);
    doc.text(unit, margin + (pageWidth - 2 * margin) * 0.7 + 2, y);
    doc.text(codalRef, margin + (pageWidth - 2 * margin) * 0.85 + 2, y);
    y += lineHeight;
  });

  y += 5; // Add some space after the section
  return y;
};

/**
 * Generates a Plumbing Calculation Report PDF.
 * This function is now defined directly within this file.
 * @param {object} calculationResult - The result data from the plumbing calculation API.
 * @param {object} formData - The form input data used for the calculation.
 * @param {string} projectName - The name of the project.
 * @param {string} activity - The activity related to the calculation (e.g., "Drainage Pipes").
 * @param {string} reportTitle - The main title for the report (e.g., "Drainage Pipes Calculation Report").
 * @param {Array<Array<string>>} inputFields - An array of arrays [label, key, unit, codalRef] for input data.
 * @param {Array<Array<string>>} resultFields - An array of arrays [label, key, unit, codalRef] for result data.
 */
const generatePlumbingReportPdf = (
  calculationResult,
  formData,
  projectName,
  activity,
  reportTitle,
  inputFields,
  resultFields
) => {
  if (!calculationResult || !calculationResult.data) {
    console.warn("No calculation result data available to generate PDF.");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const lineHeight = 6;
  let y = margin;

  // --- Header ---
  doc.setFillColor(63, 81, 181); // Dark blue header
  doc.rect(0, 0, pageWidth, 25, "F"); // Header bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255); // White text
  doc.text(reportTitle, pageWidth / 2, 15, { align: "center" });

  y = 35; // Start content below the header

  // --- Project Information ---
  const projectInfoRows = [
    ["Project Name", projectName || "N/A", "", ""],
    ["Activity", activity || "N/A", "", ""],
    ["Date", new Date().toLocaleDateString(), "", ""],
  ];
  y = addSection(
    doc,
    "PROJECT INFORMATION",
    projectInfoRows,
    y,
    pageWidth,
    margin,
    lineHeight
  );

  // Add a small space between sections
  y += 10;

  // --- Calculation Input Data ---
  const inputDataRows = inputFields.map(([label, key, unit, codalRef]) => [
    label,
    formData[key] !== undefined ? String(formData[key]) : "N/A",
    unit,
    codalRef,
  ]);
  y = addSection(
    doc,
    "CALCULATION INPUT DATA",
    inputDataRows,
    y,
    pageWidth,
    margin,
    lineHeight
  );

  // Add a small space between sections
  y += 10;

  // --- Calculation Result ---
  const calculatedData = calculationResult.data[0] || {}; // Assuming result is in data[0]

  const resultDataRows = resultFields.map(([label, key, unit, codalRef]) => [
    label,
    calculatedData[key] !== undefined ? calculatedData[key].toFixed(4) : "N/A", // Format to 4 decimal places
    unit,
    codalRef,
  ]);
  y = addSection(
    doc,
    "CALCULATION RESULT",
    resultDataRows,
    y,
    pageWidth,
    margin,
    lineHeight
  );

  // Save the PDF
  doc.save(`${reportTitle.replace(/ /g, "_")}.pdf`);
};

export default function DrainagePipesModal({
  data,
  formData,
  projectName,
  activity,
  onClose,
}) {
  // Define the input fields for the PDF and UI (mapped to formData keys from DrainagePipesForm.jsx)
  const inputFields = [
    ["Number of WB", "wb", "", ""],
    ["Number of Health Faucet", "healthFaucet", "", ""],
    ["Number of Floor Drain", "floorDrain", "", ""],
    ["Number of Service Sink", "serviceSink", "", ""],
    ["Number of Kitchen Sink", "kitchenSink", "", ""],
    ["Number of Shower", "shower", "", ""],
    ["Number of WC", "wc", "", ""],
    ["Number of Urinal", "urinal", "", ""],
    ["Number of Urinal Tap", "urinalTrap", "", ""],
    ["Total Fixture Unit", "fixtureUnit", "", ""],
    ["Soil & Waste Pipe Size as per NBC", "SoilWastePipeSize", "mm", ""],
    ["Pipe Slope", "pipeSlope", "%", ""],
    ["Velocity", "velocity", "m/s", ""],
    ["Pipe Size", "pipeSize", "mm", ""],
  ];

  // Define the result fields for the PDF and UI (mapped to data keys from API response)
  const resultFields = [
    ["Diameter", "total_fixture_unit_soil", "mm", ""],
    ["Specification", "total_fixture_unit_waste", "", ""],
  ];

  const handleDownload = () => {
    generatePlumbingReportPdf(
      data, // This is the calculationResult from the API
      formData, // This is the form data passed from the parent
      projectName,
      activity,
      "Plumbing - Drainage Pipes Report",
      inputFields,
      resultFields
    );
  };

  const calculationResult = data && data.length > 0 ? data[0] : null;

  return (
    <div className="px-6 relative">
      {" "}
      {/* Added relative for positioning close button */}
      <div className="py-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-full text-sm"
          aria-label="Close report"
        >
          X
        </button>

        <div className="text-lg font-bold border-b border-gray-300 p-6 text-gray-800">
          Drainage Pipe Size Report
        </div>

        {/* Project Information Section */}
        <div className="flex flex-col gap-4 py-4 px-4 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800">
            PROJECT INFORMATION:
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col">
              <div className="font-semibold text-gray-600">PROJECT NAME:</div>
              <div className="p-2 border border-gray-300 rounded bg-gray-100">
                {projectName || "N/A"}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-gray-600">ACTIVITY:</div>
              <div className="p-2 border border-gray-300 rounded bg-gray-100">
                {activity || "N/A"}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-gray-600">DATE:</div>
              <div className="p-2 border border-gray-300 rounded bg-gray-100">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Input Data Section */}
        <div className="flex flex-col gap-4 py-4 px-4 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800">
            CALCULATION INPUT DATA:
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {inputFields.map(([label, key, unit]) => (
              <div key={key} className="flex flex-col">
                <div className="font-semibold text-gray-600">
                  {label.toUpperCase()}:
                </div>
                <div className="p-2 border border-gray-300 rounded bg-gray-100">
                  {formData?.[key] !== undefined
                    ? `${formData[key]} ${unit}`.trim()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Result Section */}
        <div className="flex flex-col gap-4 py-4 px-4">
          <h3 className="text-md font-semibold text-gray-800">
            CALCULATION RESULT:
          </h3>
          {calculationResult ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {resultFields.map(([label, key, unit]) => (
                <div key={key} className="flex flex-col">
                  <div className="font-semibold text-gray-600">
                    {label.toUpperCase()}:
                  </div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-100">
                    {calculationResult[key] !== undefined
                      ? `${calculationResult[key].toFixed(4)} ${unit}`.trim()
                      : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">
              Perform a calculation to see the results.
            </div>
          )}
        </div>
      </div>
      <div
        onClick={handleDownload}
        className="flex justify-center items-center bg-blue-500 h-12 rounded-lg cursor-pointer hover:bg-blue-600 transition"
      >
        <div className="text-white font-semibold text-lg">Download Report</div>
      </div>
    </div>
  );
}
