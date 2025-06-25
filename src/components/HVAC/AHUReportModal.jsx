// AHUReportModal.jsx
import jsPDF from "jspdf";

export default function AHUReportModal({ data, onClose }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFillColor(63, 81, 181);
    doc.rect(0, 10, 210, 20, "F");

    // Heading text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("AHU Calculation Report", 10, 23);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    let yPos = 40;
    const addText = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 10, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${value}`, 60, yPos);
      yPos += 8;
    };

    if (data) {
      // Input parameters
      doc.setFontSize(16);
      doc.text("Input Parameters:", 10, yPos);
      yPos += 10;
      addText("Equipment", data.equipment || "N/A");
      addText(
        "Flowrate (m³/s)",
        data.flowrate !== undefined ? data.flowrate.toFixed(4) : "N/A"
      );
      addText(
        "Width (m)",
        data.width !== undefined ? data.width.toFixed(4) : "N/A"
      );
      addText(
        "Height (m)",
        data.height !== undefined ? data.height.toFixed(4) : "N/A"
      );
      addText(
        "Length (m)",
        data.length !== undefined ? data.length.toFixed(4) : "N/A"
      );

      yPos += 10; // Add some space

      // Calculated Outputs
      doc.setFontSize(16);
      doc.text("Calculated Outputs:", 10, yPos);
      yPos += 10;

      addText(
        "Area (m²)",
        data.area_m2 !== undefined ? data.area_m2.toFixed(4) : "N/A"
      );
      addText(
        "Mean Velocity (U) (m/s)",
        data.u !== undefined ? data.u.toFixed(4) : "N/A"
      );
      addText(
        "Hydraulic Diameter (Dh) (m)",
        data.dh !== undefined ? data.dh.toFixed(4) : "N/A"
      );
      addText(
        "Equivalent Diameter (De) (m)",
        data.de !== undefined ? data.de.toFixed(4) : "N/A"
      );
      addText(
        "Equivalent Length (Le) (m)",
        data.le !== undefined ? data.le.toFixed(4) : "N/A"
      );
      addText(
        "Reynolds Number (Re)",
        data.re !== undefined ? data.re.toFixed(4) : "N/A"
      );
      addText(
        "Velocity Pressure (Pv) (Pa)",
        data.pv !== undefined ? data.pv.toFixed(4) : "N/A"
      );
      addText(
        "Roughness (ε) (m)",
        data.fixed_epsilon !== undefined ? data.fixed_epsilon.toFixed(6) : "N/A"
      );
      addText(
        "Friction Factor (λ)",
        data.lambda !== undefined ? data.lambda.toFixed(4) : "N/A"
      );
      addText(
        "Local Velocity (U₀) (m/s)",
        data.fixed_u0 !== undefined ? data.fixed_u0.toFixed(4) : "N/A"
      );
      addText(
        "Loss Coefficient (C₀)",
        data.fixed_c0 !== undefined ? data.fixed_c0.toFixed(4) : "N/A"
      );

      yPos += 10; // Add some space

      addText(
        "Frictional Pressure Drop (ΔPf) (Pa)",
        data.calculated_deltaPf !== undefined
          ? data.calculated_deltaPf.toFixed(4)
          : "N/A"
      );
      addText(
        "Local Pressure Drop (ΔPl) (Pa)",
        data.calculated_deltaPl !== undefined
          ? data.calculated_deltaPl.toFixed(4)
          : "N/A"
      );
      addText(
        "Total Pressure Drop (ΔPt) (Pa)",
        data.calculated_deltaPt !== undefined
          ? data.calculated_deltaPt.toFixed(4)
          : "N/A"
      );
    }

    // Save the PDF
    doc.save("AHU_Report.pdf");
  };

  if (!data) return null; // Don't render if no data

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            AHU Calculation Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div className="text-lg font-bold border-b border-gray-300 text-gray-800 pb-2">
            Input Parameters
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Equipment
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.equipment || "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Flowrate (m³/s)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.flowrate !== undefined ? data.flowrate.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Width (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.width !== undefined ? data.width.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Height (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.height !== undefined ? data.height.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Length (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.length !== undefined ? data.length.toFixed(4) : "N/A"}
              </div>
            </div>
          </div>

          <div className="text-lg font-bold border-b border-gray-300 text-gray-800 pt-4 pb-2">
            Calculated Outputs
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Calculated Output Fields */}
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Area (m²)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.area_m2 !== undefined ? data.area_m2.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Mean Velocity (U) (m/s)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.u !== undefined ? data.u.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Hydraulic Diameter (Dh) (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.dh !== undefined ? data.dh.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Equivalent Diameter (De) (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.de !== undefined ? data.de.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Equivalent Length (Le) (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.le !== undefined ? data.le.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Reynolds Number (Re)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.re !== undefined ? data.re.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Velocity Pressure (Pv) (Pa)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.pv !== undefined ? data.pv.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Roughness (ε) (m)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.fixed_epsilon !== undefined
                  ? data.fixed_epsilon.toFixed(6)
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Friction Factor (λ)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.lambda !== undefined ? data.lambda.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Local Velocity (U₀) (m/s)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.fixed_u0 !== undefined ? data.fixed_u0.toFixed(4) : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-gray-600 text-sm">
                Loss Coefficient (C₀)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.fixed_c0 !== undefined ? data.fixed_c0.toFixed(4) : "N/A"}
              </div>
            </div>

            {/* Pressure Drops */}
            <div className="flex flex-col gap-1 col-span-2">
              <div className="font-semibold text-gray-600 text-sm">
                Frictional Pressure Drop (ΔPf) (Pa)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.calculated_deltaPf !== undefined
                  ? data.calculated_deltaPf.toFixed(4)
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <div className="font-semibold text-gray-600 text-sm">
                Local Pressure Drop (ΔPl) (Pa)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.calculated_deltaPl !== undefined
                  ? data.calculated_deltaPl.toFixed(4)
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <div className="font-semibold text-gray-600 text-sm">
                Total Pressure Drop (ΔPt) (Pa)
              </div>
              <div className="border border-gray-300 p-2 rounded bg-gray-100">
                {data.calculated_deltaPt !== undefined
                  ? data.calculated_deltaPt.toFixed(4)
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={handleDownload}
          className="flex justify-center items-center bg-blue-500 h-12 rounded-lg cursor-pointer hover:bg-blue-600 transition mt-6"
        >
          <div className="text-white font-semibold text-lg">
            Download Report
          </div>
        </div>
      </div>
    </div>
  );
}
