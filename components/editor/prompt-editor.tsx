import {FC} from "react";
import {PromptTextEditor} from "@/components/editor/prompt-text-editor";
import {VisualPrompt} from "@/components/editor/visual-prompt";


interface PromptEditorProps {

}

export const PromptEditor: FC<PromptEditorProps> = (props) => {
    return (
        <div className={"flex w-full"}>
            <PromptTextEditor />
            <VisualPrompt />

        </div>
    )
}
