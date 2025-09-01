"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ResizablePanelGroup, 
    ResizablePanel, 
    ResizableHandle
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense } from "react";

interface Props {
    projectId: string
};

export const ProjectView = ({ projectId }: Props) => {
    
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                defaultSize={35}
                minSize={20}
                className="flex flex-col min-h-0"
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <MessagesContainer projectId={projectId} />
                </Suspense>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={65}
                minSize={50}
                className="flex flex-col min-h-0"
            >        
                TODO: Preview for code
            </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}