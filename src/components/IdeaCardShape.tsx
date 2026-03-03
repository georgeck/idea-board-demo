"use client";

import React, { useEffect } from "react";
import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  useEditor,
  useIsEditing,
  type RecordProps,
  type TLShape,
} from "tldraw";
import { useIdeas } from "@/lib/ideas-context";
import { timeAgo } from "@/lib/time";
import EmojiReactions from "@/components/EmojiReactions";

type IdeaCardProps = {
  ideaId: string;
  w: number;
  h: number;
};

export type IdeaCardShape = TLShape & {
  type: "ideaCard";
  props: IdeaCardProps;
};

const PASTEL_COLORS = [
  "#fef3c7",
  "#dbeafe",
  "#dcfce7",
  "#fce7f3",
  "#f3e8ff",
  "#ffedd5",
];

const pickColor = (ideaId: string): string => {
  let hash = 0;
  for (let i = 0; i < ideaId.length; i++) {
    hash = (hash * 31 + ideaId.charCodeAt(i)) | 0;
  }
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
};

const IdeaCardComponent = ({
  shape,
}: {
  shape: IdeaCardShape;
}): React.ReactElement => {
  const { ideasMap, setEditingIdeaId } = useIdeas();
  const idea = ideasMap.get(shape.props.ideaId);
  const editor = useEditor();
  const isEditing = useIsEditing(shape.id);

  // When tldraw enters edit mode (double-click), open the modal instead
  useEffect(() => {
    if (isEditing && idea) {
      editor.setEditingShape(null);
      setEditingIdeaId(idea.id);
    }
  }, [isEditing, idea, editor, setEditingIdeaId]);

  if (!idea) {
    return (
      <HTMLContainer>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 p-4 text-sm text-gray-400">
          Loading...
        </div>
      </HTMLContainer>
    );
  }

  const bgColor = pickColor(idea.id);
  const creator = idea.creator;
  const displayName = creator?.displayName ?? "Anonymous";

  return (
    <HTMLContainer>
      <div
        className="flex h-full w-full flex-col rounded-xl p-4 shadow-lg"
        style={{ backgroundColor: bgColor }}
      >
        <p className="mb-2 flex-1 text-sm leading-relaxed text-gray-800 break-words">
          {idea.content}
        </p>
        <div className="mt-auto space-y-2">
          <EmojiReactions ideaId={idea.id} reactions={idea.reactions ?? []} />
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="max-w-[60%] truncate font-medium">
              {displayName}
            </span>
            <span>{timeAgo(idea.createdAt)}</span>
          </div>
        </div>
      </div>
    </HTMLContainer>
  );
};

export class IdeaCardShapeUtil extends ShapeUtil<IdeaCardShape> {
  static override type = "ideaCard" as const;
  static override props: RecordProps<IdeaCardShape> = {
    ideaId: T.string,
    w: T.number,
    h: T.number,
  };

  getDefaultProps(): IdeaCardProps {
    return { ideaId: "", w: 260, h: 220 };
  }

  getGeometry(shape: IdeaCardShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override canEdit(): boolean {
    return true;
  }
  override canResize(): boolean {
    return false;
  }
  override canBind(): boolean {
    return false;
  }
  override hideRotateHandle(): boolean {
    return true;
  }
  override isAspectRatioLocked(): boolean {
    return true;
  }

  component(shape: IdeaCardShape): React.ReactElement {
    return <IdeaCardComponent shape={shape} />;
  }

  indicator(shape: IdeaCardShape): React.ReactElement {
    return (
      <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />
    );
  }
}
