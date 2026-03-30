import { FullPageSpinner } from "../components/ui/Spinner";

export default function Loading() {
  // This automatically intercepts complete page replacements/route transitions in Next.js App Router
  return <FullPageSpinner message="ESTABLISHING CONNECTION..." />;
}
