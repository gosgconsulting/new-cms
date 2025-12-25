import React from "react";
import FlowbiteLibrary from "../components/visual-builder/FlowbiteLibrary";

const ComponentsViewer: React.FC = () => {
  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
      <FlowbiteLibrary />
    </div>
  );
};

export default ComponentsViewer;