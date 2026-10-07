import { Button } from "@/components/ui/Button";

const NotFound = () => (
  <section className="container-deck flex min-h-svh flex-col justify-center pt-[var(--header-h)]">
    <p className="label mb-6 text-sky-300">404</p>
    <h1 className="display fs-xxl text-ink">Page not found.</h1>
    <p className="mt-6 max-w-md text-lg text-mute">This page doesn’t exist. Go back to the homepage.</p>
    <div className="mt-10">
      <Button href="/">Homepage</Button>
    </div>
  </section>
);

export default NotFound;
