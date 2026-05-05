import { useParams } from "react-router-dom";
import { useProfileContent } from "@/hooks/useProfileContent";
import ChefMKhalilPage from "./profiles/ChefMKhalilPage";
import BishoyMesihaPage from "./profiles/BishoyMesihaPage";
import NotFound from "./NotFound";

const RENDERERS: Record<string, React.ComponentType<{ profile: any }>> = {
  "chef-m-khalil": ChefMKhalilPage,
  "bishoy-mesiha": BishoyMesihaPage,
};

export default function ProfileRouter() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useProfileContent(slug);

  const Renderer = slug ? RENDERERS[slug] : undefined;
  if (!Renderer) return <NotFound />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading…
      </div>
    );
  }
  if (error || !data) return <NotFound />;

  return <Renderer profile={data} />;
}
