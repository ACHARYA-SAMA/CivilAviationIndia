import { notFound } from "next/navigation";
import { Render } from "./Render";

/** Development only: renders a still of the take-off scene for poster and finale images. */
const DevRenderPage = () => {
  if (process.env.NODE_ENV === "production") notFound();
  return <Render />;
};

export default DevRenderPage;
