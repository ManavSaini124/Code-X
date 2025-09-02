import Prism from "prismjs"
import { useEffect } from "react"
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";

import "./code-theme.css"

interface CodeViewProps{
    code: string
    language: string
}

export const CodeView =({code,language}:CodeViewProps)=>{
    useEffect(()=>{
        Prism.highlightAll()
    },[code])
    return (
        <pre 
            className="p-2 bg-transparent border-none rounded-node m-0 text-xs"
        >
            <code className={`language-${language}`}>
                {code}
            </code>
        </pre>
    )
}