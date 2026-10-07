import type { Metadata } from "next";
import { GalleryExplorer, type GalleryPhoto } from "@/components/gallery/GalleryExplorer";
import { AdmitCta } from "@/components/home/AdmitCta";
import { FilmGallery } from "@/components/media/FilmGallery";
import { films } from "@/content/films";
import { GALLERY_GROUPS, galleryCaptions, galleryGroups, type GalleryGroup } from "@/content/gallery";
import { filmItems, getMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs and films from the Aero Space Society of India: campus and training, the 2015 Aerospace Museum Exhibit, Skill Africa, ceremonies, Republic Day 2012 and press coverage.",
};

const buildPhotos = (): GalleryPhoto[] =>
  (Object.entries(galleryGroups) as [GalleryGroup, readonly string[]][]).flatMap(([group, ids]) =>
    ids.flatMap((id) => {
      const media = getMedia(id);
      if (!media) return [];
      // No blur placeholders: 126 of them would add ~300 KB to the page; tiles sit on a dark ground instead.
      return [{ id, src: media.src, width: media.width, height: media.height, blur: "", title: galleryCaptions[id] ?? null, summary: GALLERY_GROUPS[group], group }];
    }),
  );

const GalleryPage = () => {
  const photos = buildPhotos();
  return (
    <>
      <GalleryExplorer photos={photos} groups={GALLERY_GROUPS} total={photos.length} />

      <section id="films" data-fl="Films" className="relative py-24 md:py-32">
        <div className="container-deck">
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-6">Films</h2>
            <p className="max-w-md text-mute lg:col-span-5 lg:col-start-8 lg:self-end">
              The society’s film for the 2015 exhibition, two ETV television reports, and the institute’s slideshow.
            </p>
          </div>
          <FilmGallery films={filmItems(films)} />
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default GalleryPage;
