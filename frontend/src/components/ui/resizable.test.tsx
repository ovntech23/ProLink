import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";

// This is just a simple test to verify that the types are correct
export const test = () => {
  return (
    <ResizablePanelGroup>
      <ResizablePanel>
        <div>Panel 1</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <div>Panel 2</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};