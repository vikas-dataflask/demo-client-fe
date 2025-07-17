import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useSaveVentilationDataMutation,
  useGetVentilationDataQuery,
  useUpdateVentilationDataMutation,
} from "../../redux/features/api/api";
import FloorPreview from "../shared/FloorPreview";

const VentilationForm = () => {
  const { projectId } = useParams();
  const rooms = useSelector((state) => state.rooms);

  const [formData, setFormData] = useState({
    room: "",
    area1: "",
    height: "",
    airChange: "",
    fans: "",
    fanDiameter: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  // API hooks
  const [saveVentilationData, { isLoading: isSaving }] =
    useSaveVentilationDataMutation();
  const [updateVentilationData, { isLoading: isUpdating }] =
    useUpdateVentilationDataMutation();

  const { data: autofillData } = useGetVentilationDataQuery(
    { project_id: projectId, room: formData.room },
    { skip: !projectId || !formData.room }
  );

  // Autofill existing data if available
  useEffect(() => {
    if (autofillData?.data?.input_data) {
      const input = autofillData.data.input_data;
      setFormData({
        room: formData.room,
        area1: input.area?.toString() || "",
        height: input.height?.toString() || "",
        airChange: input.acph?.toString() || "",
        fans: input.number_of_fans?.toString() || "",
        fanDiameter: input.fan_diameter || "",
      });
      setResult(autofillData.data.result_data);
    }
  }, [autofillData]);

  const shouldUpdate = () => !!autofillData?.data?.input_data;

  // When user selects a room, auto-fill area from store but still allow editing
  const handleRoomChange = (e) => {
    const selectedRoom = e.target.value;
    const storeRoom = rooms.find((r) => r.name === selectedRoom);

    setFormData((prev) => ({
      ...prev,
      room: selectedRoom,
      area1: storeRoom ? storeRoom.area?.toString() || "" : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.area1 ||
      !formData.height ||
      !formData.airChange ||
      !formData.fans ||
      !formData.fanDiameter
    ) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    const inputData = {
      area: parseFloat(formData.area1),
      height: parseFloat(formData.height),
      acph: parseFloat(formData.airChange),
      number_of_fans: parseInt(formData.fans),
      fan_diameter: formData.fanDiameter,
    };

    try {
      let response;
      if (shouldUpdate()) {
        response = await updateVentilationData({
          project_id: projectId,
          room: formData.room,
          input_data: inputData,
        }).unwrap();
      } else {
        response = await saveVentilationData({
          project_id: projectId,
          room: formData.room,
          input_data: inputData,
        }).unwrap();
      }
      setResult(response.data.result_data);
    } catch (err) {
      setErrorMsg(
        err?.data?.message || "Failed to save/update ventilation data."
      );
    }
  };

  return (
    <div className="flex h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-[340px] h-[92vh] bg-white border-r border-gray-300 text-sm font-medium relative flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 bg-white flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Ventilation</h2>
            <p className="text-xs text-gray-400">Updated: Just now</p>
          </div>
          <button
            type="button"
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => window.location.reload()}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div>
            <p className="text-sm text-gray-900 mb-1">Room Details</p>
            <div className="border border-gray-300 rounded-xl p-4 bg-white space-y-3">
              <div>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleRoomChange} // ✅ New handler
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                >
                  <option value="">Select Room</option>
                  {rooms?.map((room, idx) => (
                    <option key={room.id || idx} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 block">Area (m²)</label>
                <input
                  type="number"
                  name="area1"
                  value={formData.area1}
                  onChange={handleChange} // ✅ user can freely edit this
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>

              <div>
                <label className="text-gray-700 mb-1 block">Height (m)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-700 mb-1 block">
                  Air Changes (AC/Hr)
                </label>
                <input
                  type="number"
                  name="airChange"
                  value={formData.airChange}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-700 mb-1 block">
                  Number of Fans
                </label>
                <input
                  type="number"
                  name="fans"
                  value={formData.fans}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-700 mb-1 block">Fan Diameter</label>
                <select
                  name="fanDiameter"
                  value={formData.fanDiameter}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                >
                  <option value="">Select Fan Diameter</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
          </div>

          {result && (
            <div className="max-w-xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow text-blue-900">
              <h3 className="font-semibold mb-2 text-lg">
                Ventilation Calculation Result
              </h3>
              <div>
                <b>Volume:</b> {result.volume} m³
              </div>
              <div>
                <b>Flowrate:</b> {result.flowrate_m3h} m³/h (
                {result.flowrate_m3s} m³/s)
              </div>
              <div>
                <b>Fans Required:</b> {result.number_of_fans}
              </div>
              <div>
                <b>Flowrate per Fan:</b> {result.flowrate_per_fan_m3h} m³/h (
                {result.flowrate_per_fan_cfm} CFM)
              </div>
              <div>
                <b>Fan Diameter:</b> {result.selected_fan_diameter}
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-2 bg-red-100 text-red-700 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <div className="p-4 pb-8.5 border-t border-gray-200 bg-white">
          <button
            type="submit"
            disabled={isSaving || isUpdating}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-md"
          >
            {isSaving
              ? "Saving..."
              : isUpdating
              ? "Updating..."
              : "Calculate & Save"}
          </button>
        </div>
      </form>

      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default VentilationForm;
