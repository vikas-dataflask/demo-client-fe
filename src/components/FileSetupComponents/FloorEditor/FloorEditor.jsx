import FloorEditorSidebar from "./FloorEditorSidebar";
import Editor from "../../Canvas/Editor";

const FloorEditor = ({ open }) => {
  return (
    <div className="flex">
      {open && <FloorEditorSidebar />}

      <div>
        <Editor />
      </div>
    </div>
  );
};

export default FloorEditor;
