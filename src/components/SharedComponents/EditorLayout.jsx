import { useState } from "react";
import BottomToolBar from "./BottomToolBar";
import TopBar from "./TopBar";

export default function EditorLayout({ children }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };
  return (
    <div className="h-screen flex flex-col" onMouseMove={handleMouseMove}>
      <TopBar />
      <div className="flex-1 overflow-hidden">{children}</div>
      <BottomToolBar X={coords.x} Y={coords.y} />
    </div>
  );
}
