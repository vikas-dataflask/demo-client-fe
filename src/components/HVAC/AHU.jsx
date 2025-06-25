// AHU.jsx
import React, { useState, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useCalculateAHUMutation } from "../../redux/features/api/api";
import jsPDF from "jspdf";

// Receive projectName and activity as props
const AHU = ({ projectName, activity }) => {
  const [formData, setFormData] = useState({
    equipment: "Duct",
    flowrate: "",
    width: "",
    height: "",
    length: "",
  });

  // Use useEffect to update formData if props change (though projectName/activity
  // are not user-editable in this component, this keeps internal state consistent
  // if the parent HVACPage remounts AHU with different props)
  useEffect(() => {
    // This effect ensures that if projectName or activity were ever needed in formData for other
    // purposes (e.g., sending to backend with form fields), they would be updated.
    // However, since they are used directly from props for the report/API payload,
    // this specific `setFormData` might be redundant for projectName/activity,
    // but useful if `formData` had a different structure or `handleCalculate` used `formData.projectName`.
    // For clarity, we'll keep them used directly from props in handleCalculate/handleDownload.
  }, [projectName, activity]); // Dependency array to re-run if these props change

  const [
    calculateAHU,
    { data: calculationResult, isLoading, isSuccess, isError, error },
  ] = useCalculateAHUMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    console.log("Calculate button clicked!");
    console.log("Current form data:", formData);

    try {
      const dataToSend = {
        projectName: projectName, // Use prop directly for API payload
        activity: activity, // Use prop directly for API payload
        equipment: formData.equipment,
        flowrate: parseFloat(formData.flowrate),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        length: parseFloat(formData.length),
      };

      const response = await calculateAHU(dataToSend).unwrap();
      console.log("Calculation successful:", response);
    } catch (err) {
      console.error("Failed to perform calculation:", err);
    }
  };

  const handleReload = () => {
    setFormData({
      equipment: "Duct",
      flowrate: "",
      width: "",
      height: "",
      length: "",
    });
    // projectName and activity are props, so they don't reset with local form data.
  };

  // PDF download function
  const handleDownload = () => {
    if (!calculationResult || !calculationResult.data) return;

    const calculatedData = calculationResult.data;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15; // Left/Right margin for content
    const lineHeight = 8; // Consistent line height for data rows

    // --- Header ---
    doc.setFillColor(63, 81, 181); // Dark blue header
    doc.rect(0, 0, pageWidth, 25, "F"); // Header bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // White text
    doc.text("AHU Calculation Report", pageWidth / 2, 15, { align: "center" });

    // --- Content Start Position ---
    let yPos = 35; // Starting Y position for the content below the header
    const contentX = margin;
    const contentWidth = pageWidth - 2 * margin;

    // Helper function to add a section with title and content in a box
    const addSection = (title, items) => {
      // Section Title Header Bar
      doc.setFillColor(240, 240, 240); // Light gray for section title background
      doc.rect(contentX, yPos, contentWidth, 10, "F"); // Background for title bar
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50); // Darker gray for title text
      doc.text(title, contentX + 5, yPos + 7); // Title within the bar
      yPos += 10; // Move yPos past the title bar

      const sectionContentYStart = yPos; // Y position where content begins for this section

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black text for content

      // Calculate the maximum key width in this section for consistent value alignment
      let maxKeyWidth = 0;
      // Temporarily set font to bold to get accurate width of keys
      doc.setFont("helvetica", "bold");
      items.forEach(([key]) => {
        const currentKeyWidth = doc.getTextWidth(`${key}:`);
        if (currentKeyWidth > maxKeyWidth) {
          maxKeyWidth = currentKeyWidth;
        }
      });
      // Reset font to normal for values
      doc.setFont("helvetica", "normal");

      // Define the starting X for values based on maxKeyWidth plus a buffer
      const valueStartX = contentX + maxKeyWidth + 10; // 10 units buffer from the longest key

      items.forEach(([key, value, unit]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${key}:`, contentX + 5, yPos); // Key text inside the section box, slightly indented
        doc.setFont("helvetica", "normal"); // Reset font for value
        const valueText =
          value !== null && value !== undefined ? String(value) : "N/A";
        doc.text(`${valueText} ${unit}`, valueStartX, yPos); // Use dynamically calculated valueStartX
        yPos += lineHeight;
      });

      // Draw border around the content of the section
      doc.setDrawColor(200, 200, 200); // Light gray border
      doc.rect(
        contentX,
        sectionContentYStart,
        contentWidth,
        yPos - sectionContentYStart,
        "S"
      );

      yPos += 7; // Space after section
    };

    // --- Project Information Section ---
    addSection("PROJECT INFORMATION", [
      ["PROJECT", projectName || "N/A", ""],
      ["DATE", new Date().toLocaleDateString("en-GB"), ""],
      ["CALCULATION", `HVAC - ${activity.toUpperCase()}`, ""],
    ]);

    // Prepare data for input and result sections
    const inputDataItems = [
      ["EQUIPMENT", formData.equipment || "N/A", ""],
      [
        "FLOWRATE",
        formData.flowrate !== ""
          ? parseFloat(formData.flowrate).toFixed(4)
          : "N/A",
        "m³/s",
      ],
      [
        "WIDTH",
        formData.width !== "" ? parseFloat(formData.width).toFixed(4) : "N/A",
        "m",
      ],
      [
        "HEIGHT",
        formData.height !== "" ? parseFloat(formData.height).toFixed(4) : "N/A",
        "m",
      ],
      [
        "LENGTH",
        formData.length !== "" ? parseFloat(formData.length).toFixed(4) : "N/A",
        "m",
      ],
    ];

    const calculationResultItems = [
      [
        "Area",
        calculatedData.area_m2 !== undefined
          ? calculatedData.area_m2.toFixed(4)
          : "N/A",
        "m²",
      ],
      [
        "Mean Velocity (U)",
        calculatedData.u !== undefined ? calculatedData.u.toFixed(4) : "N/A",
        "m/s",
      ],
      [
        "Hydraulic Diameter (Dh)",
        calculatedData.dh !== undefined ? calculatedData.dh.toFixed(4) : "N/A",
        "m",
      ],
      [
        "Equivalent Diameter (De)",
        calculatedData.de !== undefined ? calculatedData.de.toFixed(4) : "N/A",
        "m",
      ],
      [
        "Equivalent Length (Le)",
        calculatedData.le !== undefined ? calculatedData.le.toFixed(4) : "N/A",
        "m",
      ],
      [
        "Reynolds Number (Re)",
        calculatedData.re !== undefined ? calculatedData.re.toFixed(4) : "N/A",
        "-",
      ],
      [
        "Velocity Pressure (Pv)",
        calculatedData.pv !== undefined ? calculatedData.pv.toFixed(4) : "N/A",
        "Pa",
      ],
      [
        "Roughness (ε)",
        calculatedData.fixed_epsilon !== undefined
          ? calculatedData.fixed_epsilon.toFixed(6)
          : "N/A",
        "m",
      ],
      [
        "Friction Factor (λ)",
        calculatedData.lambda !== undefined
          ? calculatedData.lambda.toFixed(4)
          : "N/A",
        "-",
      ],
      [
        "Local Velocity (U₀)",
        calculatedData.fixed_u0 !== undefined
          ? calculatedData.fixed_u0.toFixed(4)
          : "N/A",
        "m/s",
      ],
      [
        "Loss Coefficient (C₀)",
        calculatedData.fixed_c0 !== undefined
          ? calculatedData.fixed_c0.toFixed(4)
          : "N/A",
        "-",
      ],
      [
        "Frictional Pressure Drop (ΔPf)",
        calculatedData.calculated_deltaPf !== undefined
          ? calculatedData.calculated_deltaPf.toFixed(4)
          : "N/A",
        "Pa",
      ],
      [
        "Local Pressure Drop (ΔPl)",
        calculatedData.calculated_deltaPl !== undefined
          ? calculatedData.calculated_deltaPl.toFixed(4)
          : "N/A",
        "Pa",
      ],
      [
        "Total Pressure Drop (ΔPt)",
        calculatedData.calculated_deltaPt !== undefined
          ? calculatedData.calculated_deltaPt.toFixed(4)
          : "N/A",
        "Pa",
      ],
    ];

    // Using the new addSection function for input and result data
    addSection("CALCULATION INPUT DATA", inputDataItems);
    addSection("CALCULATION RESULT", calculationResultItems);

    // Save the PDF
    doc.save(
      `AHU_${projectName || "Report"}_${new Date().toLocaleDateString()}.pdf`
    );
  };

  // Input fields for the left sidebar (user editable)
  const inputFields = [
    ["Flowrate", "flowrate", "m³/s"],
    ["Width", "width", "m"],
    ["Height", "height", "m"],
    ["Length", "length", "m"],
  ];

  // Calculated fields for display in both left sidebar and right report
  const calculatedFields = [
    ["Area", "area_m2", "m²"],
    ["Mean Velocity (U)", "u", "m/s"],
    ["Hydraulic Diameter (Dh)", "dh", "m"],
    ["Equivalent Diameter (De)", "de", "m"],
    ["Equivalent Length (Le)", "le", "m"],
    ["Reynolds Number (Re)", "re", "-"],
    ["Velocity Pressure (Pv)", "pv", "Pa"],
    ["Roughness (ε)", "fixed_epsilon", "m"],
    ["Friction Factor (λ)", "lambda", "-"],
    ["Local Velocity (U₀)", "fixed_u0", "m/s"],
    ["Loss Coefficient (C₀)", "fixed_c0", "-"],
    ["Frictional Pressure Drop (ΔPf)", "calculated_deltaPf", "Pa"],
    ["Local Pressure Drop (ΔPl)", "calculated_deltaPl", "Pa"],
    ["Total Pressure Drop (ΔPt)", "calculated_deltaPt", "Pa"],
  ];

  return (
    <div className="flex h-screen">
      {/* Left Sidebar (Input Form) */}
      <div className="w-[340px] bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-800">AHU</h2>
              <p className="text-xs text-gray-400">Updated: Just now</p>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={handleReload}
            >
              <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Project Name and Activity fields are intentionally REMOVED from this UI */}
          {/* They are passed as props and used directly in the report */}

          {/* Equipment Dropdown */}
          <div className="space-y-1">
            <label className="text-gray-800 block">EQUIPMENT</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            >
              {[
                "Duct",
                "Damper",
                "Duct connection",
                "Filter",
                "Coil",
                "Plenum",
                "Bend 90 Degree Vanes",
                "Attenuator",
                "Tee",
                "Contraction",
                "Branch",
                "Expansion",
                "1st Grille",
                "2nd Grille",
                "3rd Grille",
                "4th Grille",
                "5th Grille",
                "6th Grille",
                "7th Grille",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* User Input Fields (Flowrate, Width, Height, Length) */}
          {inputFields.map(([label, name, unit]) => (
            <div key={name} className="space-y-1">
              <label className="text-gray-800 block">{label}</label>
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-3/4 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0083EE] bg-gray-50"
                  step="any"
                />
                <span className="w-1/4 text-center bg-gray-200 p-2 rounded-md text-gray-500">
                  {unit}
                </span>
              </div>
            </div>
          ))}

          {/* Existing Calculated Output Fields (on the left sidebar - for quick reference) */}
          {isSuccess && calculationResult && calculationResult.data && (
            <>
              <h3 className="text-[15px] font-semibold text-gray-800 mt-4 border-t pt-4">
                Calculated Outputs (Quick View)
              </h3>
              {calculatedFields.map(([label, key, unit]) => (
                <div key={key} className="space-y-1">
                  <label className="text-gray-800 block">{label}</label>
                  <div className="flex space-x-2 items-center">
                    <input
                      type="text"
                      value={
                        calculationResult.data[key] !== undefined
                          ? calculationResult.data[key].toFixed(4)
                          : "N/A"
                      }
                      readOnly
                      className="w-3/4 p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700"
                    />
                    <span className="w-1/4 text-center bg-gray-200 p-2 rounded-md text-gray-500">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="pb-20 border-t border-gray-200 p-4">
          <button
            onClick={handleCalculate}
            className="w-full bg-[#0083EE] text-white p-3 rounded-md font-semibold hover:bg-[#1C69D4] transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
          {isError && error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              <h3 className="font-semibold">Error:</h3>
              <p>
                {error.data?.message ||
                  error.message ||
                  "An unknown error occurred"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane (Report Display - Mimicking Sample Result Sheet) */}
      <div className="flex-grow p-6 bg-gray-50 overflow-y-auto">
        {isSuccess && calculationResult && calculationResult.data ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Report Header - Mimicking Screenshot */}
            <div className="bg-[#3F51B5] text-white p-4 rounded-t-lg mb-4 text-center">
              <h2 className="text-2xl font-bold">AHU Calculation Report</h2>
            </div>

            <div className="space-y-6 py-4">
              {/* Project Information */}
              <div className="border-b border-gray-300 pb-2 mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  PROJECT INFORMATION:
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">PROJECT:</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {projectName || "N/A"}
                  </div>
                </div>
                {/* Removed CLIENT, LOCATION, DESIGN BY, CHECKED BY, SHEET No. as requested */}
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">DATE:</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">
                    CALCULATION:
                  </div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">{`HVAC - ${activity.toUpperCase()}`}</div>
                </div>
              </div>

              {/* Calculation Input Data */}
              <div className="border-b border-gray-300 pb-2 mb-4 pt-6">
                <h3 className="text-lg font-bold text-gray-800">
                  CALCULATION INPUT DATA:
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">EQUIPMENT:</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formData.equipment || "N/A"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">
                    FLOWRATE (m³/s):
                  </div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formData.flowrate !== ""
                      ? parseFloat(formData.flowrate).toFixed(4)
                      : "N/A"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">WIDTH (m):</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formData.width !== ""
                      ? parseFloat(formData.width).toFixed(4)
                      : "N/A"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">HEIGHT (m):</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formData.height !== ""
                      ? parseFloat(formData.height).toFixed(4)
                      : "N/A"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-600">LENGTH (m):</div>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    {formData.length !== ""
                      ? parseFloat(formData.length).toFixed(4)
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Calculation Result */}
              <div className="border-b border-gray-300 pb-2 mb-4 pt-6">
                <h3 className="text-lg font-bold text-gray-800">
                  CALCULATION RESULT:
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {calculatedFields.map(([label, key]) => (
                  <div key={key} className="flex flex-col">
                    <div className="font-semibold text-gray-600">
                      {label.toUpperCase()}:
                    </div>{" "}
                    {/* Match sample's ALL CAPS */}
                    <div className="p-2 border border-gray-300 rounded bg-gray-50">
                      {calculationResult.data[key] !== undefined
                        ? calculationResult.data[key].toFixed(4)
                        : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div
              onClick={handleDownload}
              className="flex justify-center items-center bg-blue-500 h-12 rounded-lg cursor-pointer hover:bg-blue-600 transition mt-6"
            >
              <div className="text-white font-semibold text-lg">
                Download Report
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Perform a calculation to see the report here.
          </div>
        )}
      </div>
    </div>
  );
};

export default AHU;
