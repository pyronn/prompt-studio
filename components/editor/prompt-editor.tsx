import { FC } from "react";
import { PromptTextEditor } from "@/components/editor/prompt-text-editor";
import { VisualPrompt } from "@/components/editor/visual-prompt";
import { PromptEditorProvider } from "@/components/editor/prompt-editor-context";

export const PromptEditor: FC = () => {
    return (
        <PromptEditorProvider>
            <div className="flex w-full gap-4 p-4">
                <PromptTextEditor className="w-2/5" />
                <VisualPrompt className="w-3/5" />
            </div>
        </PromptEditorProvider>
    );
};
