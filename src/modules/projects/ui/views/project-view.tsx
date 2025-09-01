"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ResizablePanelGroup, 
    ResizablePanel, 
    ResizableHandle
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";

interface Props {
    projectId: string
};

export const ProjectView = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                defaultSize={35}
                minSize={20}
                className="flex flex-col min-h-0"
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <ProjectHeader projectId={projectId} />
                </Suspense>
                <Suspense fallback={<div>Loading...</div>}>
                    <MessagesContainer 
                        projectId={projectId} 
                        activeFragment={activeFragment}
                        setActiveFragment={setActiveFragment}
                    />
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