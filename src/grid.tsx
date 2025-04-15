import React, { useRef, useState, useEffect } from "react";
import perspective from "@finos/perspective";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import "@finos/perspective-viewer-openlayers";
import "./index.css";

const App: React.FC = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => dropArea.classList.add("highlight");
    const unhighlight = () => dropArea.classList.remove("highlight");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener("drop", handleDrop, false);

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.removeEventListener(eventName, preventDefaults);
      });
    };
  }, []);

  const handleDrop = (e: DragEvent) => {
    const dt = e.dataTransfer;
    if (dt && dt.files) {
      handleFiles(dt.files);
    }
  };

  const handleFiles = (files: FileList) => {
    [...files].forEach(uploadFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const uploadFile = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = event.target?.result;
      if (!data || !containerRef.current) return;

      setDataLoaded(true);

      const viewer = document.createElement("perspective-viewer") as any;
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(viewer);

      const worker = await perspective.worker();
     
      const table = file.name.endsWith(".csv")
        ? worker.table(data, { format: "csv" })
        : worker.table(data);
      viewer.load(table);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div ref={containerRef}>
      {!dataLoaded && (
        <div id="drop-area" ref={dropAreaRef}>
          <form className="my-form">
            <p>Upload a CSV/Arrow file by dragging from your desktop and dropping onto the dashed region.</p>
            <p>(Data is processed in browser, and never sent to any server).</p>
            <input
              type="file"
              id="fileElem"
              multiple
              accept=".feather,.arrow,.csv"
              onChange={handleFileChange}
            />
            <label className="button" htmlFor="fileElem">
              Select a file
            </label>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
