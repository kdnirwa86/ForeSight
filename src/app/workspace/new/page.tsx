import CreateWorkspace from "@/components/workspace/CreateWorkspace";

interface Props {
  searchParams: { edit?: string };
}

export default function NewWorkspacePage({ searchParams }: Props) {
  return <CreateWorkspace editId={searchParams?.edit} />;
}
