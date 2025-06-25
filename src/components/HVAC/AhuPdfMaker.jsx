import jsPDF from "jspdf";

/**
 * Generates an AHU Calculation Report PDF.
 * @param {object} calculationResult - The result data from the AHU calculation API.
 * @param {object} formData - The form input data used for the calculation.
 * @param {string} projectName - The name of the project.
 * @param {string} activity - The activity related to the calculation (e.g., "AHU").
 */
export const generateAHUReportPdf = (
  calculationResult,
  formData,
  projectName,
  activity
) => {
  if (!calculationResult || !calculationResult.data) {
    console.warn("No calculation result data available to generate PDF.");
    return;
  }

  const calculatedData = calculationResult.data;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const lineHeight = 6; // Reduced line height for data rows

  // --- Header ---
  doc.setFillColor(63, 81, 181); // Dark blue header
  doc.rect(0, 0, pageWidth, 25, "F"); // Header bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Reduced font size for main header
  doc.setTextColor(255, 255, 255); // White text
  doc.text("AHU Calculation Report", pageWidth / 2, 15, { align: "center" });

  // --- Content Start Position ---
  let yPos = 25; // Adjusted starting Y position for the content below the header
  const contentX = margin;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add a section with title and content in a box
  const addSection = (title, items, includeColumnHeaders = false) => {
    // Section Title Header Bar
    doc.setFillColor(240, 240, 240); // Light gray for section title background
    doc.rect(contentX, yPos, contentWidth, 10, "F"); // Background for title bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Reduced font size for section title
    doc.setTextColor(50, 50, 50); // Darker gray for title text
    doc.text(title, contentX + 5, yPos + 7); // Title within the bar
    yPos += 10; // Move yPos past the title bar

    // Small vertical buffer between title bar and content
    yPos += 3; // Reduced buffer

    const sectionContentYStart = yPos;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9); // Reduced font size for content
    doc.setTextColor(0, 0, 0);

    let factorColX;
    let valueColX;
    let codalRefColX;

    if (includeColumnHeaders) {
      // --- Column Headers for Factor, Value, and Codal ref ---
      doc.setFont("helvetica", "bold");
      const padding = 5;
      const col1Width = contentWidth * 0.35; // 35% for Factor
      const col2Width = contentWidth * 0.3; // 30% for Value (with unit)
      const col3Width = contentWidth * 0.3; // 30% for Codal ref

      factorColX = contentX + padding;
      valueColX = factorColX + col1Width + padding;
      codalRefColX = valueColX + col2Width + padding;

      const headerTextY = yPos + 3; // Adjusted text baseline
      doc.text("FACTOR", factorColX, headerTextY);
      doc.text("VALUE", valueColX, headerTextY);
      doc.text("CODAL REF", codalRefColX, headerTextY);

      yPos += lineHeight; // Move yPos past header row
      yPos += 4; // Reduced buffer after header text row

      // Draw a line under the headers for visual separation
      doc.setDrawColor(180, 180, 180);
      doc.line(contentX, yPos, contentX + contentWidth, yPos);
      yPos += 6; // Reduced buffer after the line
    } else {
      // For sections without column headers (like PROJECT INFORMATION)
      let maxKeyWidth = 0;
      doc.setFont("helvetica", "bold");
      items.forEach(([key]) => {
        const currentKeyWidth = doc.getTextWidth(`${key}:`);
        if (currentKeyWidth > maxKeyWidth) {
          maxKeyWidth = currentKeyWidth;
        }
      });
      doc.setFont("helvetica", "normal");

      factorColX = contentX + 5;
      valueColX = contentX + 5 + maxKeyWidth + 30;
      codalRefColX = valueColX; // Not used but kept for consistency
    }

    // --- Items Loop ---
    items.forEach(([key, value, unit, codalRef]) => {
      const textYPosition = yPos + 3; // Adjusted text baseline

      if (includeColumnHeaders) {
        doc.setFont("helvetica", "normal");
        doc.text(key, factorColX, textYPosition);
        const valueText =
          value !== null && value !== undefined ? String(value) : "N/A";
        doc.text(`${valueText} ${unit}`, valueColX, textYPosition);
        doc.text(codalRef || "N/A", codalRefColX, textYPosition);
      } else {
        doc.setFont("helvetica", "bold");
        doc.text(`${key}:`, factorColX, textYPosition);
        doc.setFont("helvetica", "normal");
        const valueText =
          value !== null && value !== undefined ? String(value) : "N/A";
        doc.text(`${valueText} ${unit}`, valueColX, textYPosition);
      }
      yPos += lineHeight;
    });

    // Draw border around the content of the section
    doc.setDrawColor(200, 200, 200);
    doc.rect(
      contentX,
      sectionContentYStart,
      contentWidth,
      yPos - sectionContentYStart,
      "S"
    );

    yPos += 4; // Reduced space after section
  };

  // --- Project Information Section ---
  addSection(
    "PROJECT INFORMATION",
    [
      ["PROJECT", projectName || "N/A", "", ""],
      ["DATE", new Date().toLocaleDateString("en-GB"), "", ""],
      ["CALCULATION", `HVAC - ${activity.toUpperCase()}`, "", ""],
    ],
    false
  );

  // Prepare data for input and result sections
  const inputDataItems = [
    ["EQUIPMENT", formData.equipment || "N/A", "", ""],
    [
      "FLOWRATE",
      formData.flowrate !== ""
        ? parseFloat(formData.flowrate).toFixed(4)
        : "N/A",
      "m³/s",
      "",
    ],
    [
      "WIDTH",
      formData.width !== "" ? parseFloat(formData.width).toFixed(4) : "N/A",
      "m",
      "",
    ],
    [
      "HEIGHT",
      formData.height !== "" ? parseFloat(formData.height).toFixed(4) : "N/A",
      "m",
      "",
    ],
    [
      "LENGTH",
      formData.length !== "" ? parseFloat(formData.length).toFixed(4) : "N/A",
      "m",
      "",
    ],
  ];

  const calculationResultItems = [
    [
      "Area",
      calculatedData.area_m2 !== undefined
        ? calculatedData.area_m2.toFixed(4)
        : "N/A",
      "m²",
      "",
    ],
    [
      "Mean Velocity (U)",
      calculatedData.u !== undefined ? calculatedData.u.toFixed(4) : "N/A",
      "m/s",
      "",
    ],
    [
      "Hydraulic Diameter (Dh)",
      calculatedData.dh !== undefined ? calculatedData.dh.toFixed(4) : "N/A",
      "m",
      "",
    ],
    [
      "Equivalent Diameter (De)",
      calculatedData.de !== undefined ? calculatedData.de.toFixed(4) : "N/A",
      "m",
      "",
    ],
    [
      "Equivalent Length (Le)",
      calculatedData.le !== undefined ? calculatedData.le.toFixed(4) : "N/A",
      "m",
      "",
    ],
    [
      "Reynolds Number (Re)",
      calculatedData.re !== undefined ? calculatedData.re.toFixed(4) : "N/A",
      "-",
      "",
    ],
    [
      "Velocity Pressure (Pv)",
      calculatedData.pv !== undefined ? calculatedData.pv.toFixed(4) : "N/A",
      "Pa",
      "",
    ],
    [
      "Roughness (ε)",
      calculatedData.fixed_epsilon !== undefined
        ? calculatedData.fixed_epsilon.toFixed(6)
        : "N/A",
      "m",
      "",
    ],
    [
      "Friction Factor (λ)",
      calculatedData.lambda !== undefined
        ? calculatedData.lambda.toFixed(4)
        : "N/A",
      "-",
      "",
    ],
    [
      "Local Velocity (U₀)",
      calculatedData.fixed_u0 !== undefined
        ? calculatedData.fixed_u0.toFixed(4)
        : "N/A",
      "m/s",
      "",
    ],
    [
      "Loss Coefficient (C₀)",
      calculatedData.fixed_c0 !== undefined
        ? calculatedData.fixed_c0.toFixed(4)
        : "N/A",
      "-",
      "",
    ],
    [
      "Frictional Pressure Drop (ΔPf)",
      calculatedData.calculated_deltaPf !== undefined
        ? calculatedData.calculated_deltaPf.toFixed(4)
        : "N/A",
      "Pa",
      "",
    ],
    [
      "Local Pressure Drop (ΔPl)",
      calculatedData.calculated_deltaPl !== undefined
        ? calculatedData.calculated_deltaPl.toFixed(4)
        : "N/A",
      "Pa",
      "",
    ],
    [
      "Total Pressure Drop (ΔPt)",
      calculatedData.calculated_deltaPt !== undefined
        ? calculatedData.calculated_deltaPt.toFixed(4)
        : "N/A",
      "Pa",
      "",
    ],
  ];

  addSection("CALCULATION INPUT DATA", inputDataItems, true);
  addSection("CALCULATION RESULT", calculationResultItems, true);

  // Save the PDF
  doc.save(
    `AHU_${projectName || "Report"}_${new Date().toLocaleDateString(
      "en-GB"
    )}.pdf`
  );
};
