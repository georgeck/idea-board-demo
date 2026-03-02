"use client";

import React, { useCallback } from "react";
import { Tldraw, type Editor, type TLUiComponents } from "tldraw";
import "tldraw/tldraw.css";
import { IdeaCardShapeUtil } from "@/components/IdeaCardShape";

const shapeUtils = [IdeaCardShapeUtil];

const hiddenComponents: TLUiComponents = {
  Toolbar: null,
  MainMenu: null,
  PageMenu: null,
  ActionsMenu: null,
  StylePanel: null,
  MenuPanel: null,
  Minimap: null,
  NavigationPanel: null,
  HelpMenu: null,
  QuickActions: null,
  HelperButtons: null,
  DebugPanel: null,
  DebugMenu: null,
  KeyboardShortcutsDialog: null,
  ZoomMenu: null,
};

const Canvas = ({
  onMount,
}: {
  onMount: (editor: Editor) => void;
}): React.ReactElement => {
  const handleMount = useCallback(
    (editor: Editor): void => {
      onMount(editor);
    },
    [onMount],
  );

  return (
    <div className="fixed inset-0">
      <Tldraw
        shapeUtils={shapeUtils}
        components={hiddenComponents}
        onMount={handleMount}
      />
    </div>
  );
};

export default Canvas;
