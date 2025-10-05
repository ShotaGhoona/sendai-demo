import { AiAgentDetailContainer } from "@/page-components/ai-agent/detail/ui/aiAgentDetailContainer";

interface AiAgentDetailPageProps {
  params: {
    chatId: string
  }
}

export default function AiAgentDetailPage({ params }: AiAgentDetailPageProps) {
  return (
    <div>
      <AiAgentDetailContainer chatId={params.chatId} />
    </div>
  );
}