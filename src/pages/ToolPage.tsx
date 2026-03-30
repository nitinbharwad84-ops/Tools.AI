import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { ToolId } from "../components/Dashboard";
import { SocialGenTool } from "../components/SocialGenTool";
import { SummarizerTool } from "../components/SummarizerTool";
import { ResumeRoasterTool } from "../components/ResumeRoasterTool";
import { EmailPacifierTool } from "../components/EmailPacifierTool";
import { ImageGenTool } from "../components/ImageGenTool";
import { GrammarFixerTool } from "../components/GrammarFixerTool";
import { VideoAnalyzerTool } from "../components/VideoAnalyzerTool";

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();

  switch (toolId as ToolId) {
    case "social-gen":
      return <SocialGenTool />;
    case "summarizer":
      return <SummarizerTool />;
    case "resume-roaster":
      return <ResumeRoasterTool />;
    case "email-pacifier":
      return <EmailPacifierTool />;
    case "image-gen":
      return <ImageGenTool />;
    case "grammar-fixer":
      return <GrammarFixerTool />;
    case "video-analyzer":
      return <VideoAnalyzerTool />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};
