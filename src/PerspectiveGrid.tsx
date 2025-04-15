import React, { useEffect } from "react";

import "https://cdn.jsdelivr.net/npm/@finos/perspective-viewer@3.5.0/dist/cdn/perspective-viewer.js";
import "https://cdn.jsdelivr.net/npm/@finos/perspective-viewer-datagrid@3.5.0/dist/cdn/perspective-viewer-datagrid.js";
import "https://cdn.jsdelivr.net/npm/@finos/perspective-viewer-d3fc@3.5.0/dist/cdn/perspective-viewer-d3fc.js";
import "https://cdn.jsdelivr.net/npm/@finos/perspective-viewer-openlayers/dist/cdn/perspective-viewer-openlayers.js";

const PerspectiveGrid: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      const perspective = await import("https://cdn.jsdelivr.net/npm/@finos/perspective@3.5.0/dist/cdn/perspective.js");
      const worker = await perspective.worker();

      const dropArea = document.getElementById("drop-area") as HTMLDivElement;
      const input = document.getElementById("fileElem") as HTMLInputElement;

      const preventDefaults = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const highlight = () => {
        dropArea.classList.add("highlight");
      };

      const unhighlight = () => {
        dropArea.classList.remove("highlight");
      };

      const handleFiles = (files: FileList) => {
        [...files].forEach(uploadFile);
      };

      const handleDrop = (e: DragEvent) => {
        const dt = e.dataTransfer;
        const files = dt?.files;
        if (files) handleFiles(files);
      };

      const uploadFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = function (fileLoadedEvent: ProgressEvent<FileReader>) {
          const data = fileLoadedEvent.target?.result;
          if (data) {
            const parent = dropArea.parentElement!;
            parent.removeChild(dropArea);

            const psp = document.createElement("perspective-viewer");
            parent.appendChild(psp);
            psp.style.height = "100vh";
            psp.style.width = "100%";

            if (
              file.name.endsWith(".feather") ||
              file.name.endsWith(".arrow")
            ) {
              psp.load(worker.table(data));
            } else if (file.name.endsWith(".json")) {
              const jsonText = new TextDecoder("utf-8").decode(data);
              const jsonParsed = JSON.parse(jsonText);
              psp.load(worker.table(jsonParsed));
            } else {
              psp.load(worker.table(data, { format: "csv" }));
            }
             
          }
        };
        reader.readAsArrayBuffer(file);
      };

      // Add drag and drop event listeners
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
      input.addEventListener("change", () => handleFiles(input.files!));
    };

    init();
  }, []);

  return (
    <div className="table-div">
      <div id="drop-area">
        <form className="my-form">
          <p>
            Upload a CSV/Arrow file by dragging from your desktop and dropping
            onto the dashed region.
          </p>
          <p>(Data is processed in browser, and never sent to any server).</p>
          <input
            type="file"
            id="fileElem"
            multiple
            accept=".feather,.arrow,.csv"
          />
          <label className="button" htmlFor="fileElem">
            Select a file
          </label>
        </form>
      </div>
    </div>
  );
};

export default PerspectiveGrid;
