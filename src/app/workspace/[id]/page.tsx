import OutputDashboard from "@/components/output/OutputDashboard";

export default function WorkspacePage({ params }: { params: { id: string } }) {
  return <OutputDashboard workspaceId={params.id} />;
}
