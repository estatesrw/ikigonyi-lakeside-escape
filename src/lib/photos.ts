// Photography of Ikigonyi Round House, Lake Muhazi (Rwamagana, Rwanda).
import roundHouseExterior from "@/assets/listing/round-house-exterior.jpg.asset.json";
import roundHouseNight from "@/assets/listing/round-house-night.jpg.asset.json";
import annexeNight from "@/assets/listing/annexe-night.jpg.asset.json";
import propertyLandscape from "@/assets/listing/property-landscape.jpg.asset.json";
import terraceLake from "@/assets/listing/terrace-lake.jpg.asset.json";
import lakeView from "@/assets/listing/lake-view.jpg.asset.json";
import livingRoom from "@/assets/listing/living-room.jpg.asset.json";
import livingRoomLounge from "@/assets/listing/living-room-lounge.jpg.asset.json";
import livingStairs from "@/assets/listing/living-stairs.jpg.asset.json";
import diningKitchen from "@/assets/listing/dining-kitchen.jpg.asset.json";
import thatchedRoof from "@/assets/listing/thatched-roof.jpg.asset.json";
import bedroomKing from "@/assets/listing/bedroom-king.jpg.asset.json";
import bedroomCanopy from "@/assets/listing/bedroom-canopy.jpg.asset.json";
import bedroomTwin from "@/assets/listing/bedroom-twin.jpg.asset.json";
import bedroomLamplight from "@/assets/listing/bedroom-lamplight.jpg.asset.json";
import bedroomDarkWood from "@/assets/listing/bedroom-dark-wood.jpg.asset.json";
import bedroomAnnexe from "@/assets/listing/bedroom-annexe.jpg.asset.json";
import bathroomStone from "@/assets/listing/bathroom-stone.jpg.asset.json";
import bathroomShower from "@/assets/listing/bathroom-shower.jpg.asset.json";

// Official photography by PointImage (Pixieset delivery, August 2026).
import pxBalconyLake from "@/assets/pixieset/balcony-lake-view.jpg.asset.json";
import pxBedroomCarved from "@/assets/pixieset/bedroom-carved-bed.jpg.asset.json";
import pxLakeSteps from "@/assets/pixieset/lake-steps.jpg.asset.json";
import pxLakeViewBw from "@/assets/pixieset/lake-view-bw.jpg.asset.json";
import pxBedroomWhite from "@/assets/pixieset/bedroom-white.jpg.asset.json";
import pxLandscapeBw from "@/assets/pixieset/landscape-bw.jpg.asset.json";
import pxBedroomTwinWarm from "@/assets/pixieset/bedroom-twin-warm.jpg.asset.json";
import pxTerraceLakeGreen from "@/assets/pixieset/terrace-lake-green.jpg.asset.json";
import pxLampImigongo from "@/assets/pixieset/lamp-imigongo.jpg.asset.json";
import pxBedroomWoven from "@/assets/pixieset/bedroom-woven-ceiling.jpg.asset.json";
import pxExteriorThatch from "@/assets/pixieset/exterior-thatch.jpg.asset.json";
import pxShowerGrey from "@/assets/pixieset/shower-grey.jpg.asset.json";
import pxLakeBoatSteps from "@/assets/pixieset/lake-boat-steps.jpg.asset.json";
import pxLampBw from "@/assets/pixieset/lamp-bw.jpg.asset.json";
import pxBedroomWarm from "@/assets/pixieset/bedroom-warm.jpg.asset.json";
import pxShowerWarm from "@/assets/pixieset/shower-warm.jpg.asset.json";
import pxExteriorDriveway from "@/assets/pixieset/exterior-driveway.jpg.asset.json";

// Lovable Assets use a platform-served path. Keep the delivery origin explicit so
// the same images continue to work when the built site is hosted on another domain.
export const ASSET_ORIGIN = "https://ikigonyi.lovable.app";

export function publicMediaUrl(url?: string | null) {
  if (!url) return "";
  return url.startsWith("/__l5e/assets-v1/") ? `${ASSET_ORIGIN}${url}` : url;
}

export const photos = {
  exterior: publicMediaUrl(roundHouseExterior.url),
  exteriorNight: publicMediaUrl(roundHouseNight.url),
  annexeNight: publicMediaUrl(annexeNight.url),
  landscape: publicMediaUrl(propertyLandscape.url),
  terrace: publicMediaUrl(terraceLake.url),
  lake: publicMediaUrl(lakeView.url),
  living: publicMediaUrl(livingRoom.url),
  livingLounge: publicMediaUrl(livingRoomLounge.url),
  livingStairs: publicMediaUrl(livingStairs.url),
  dining: publicMediaUrl(diningKitchen.url),
  thatch: publicMediaUrl(thatchedRoof.url),
  bedroomKing: publicMediaUrl(bedroomKing.url),
  bedroomCanopy: publicMediaUrl(bedroomCanopy.url),
  bedroomTwin: publicMediaUrl(bedroomTwin.url),
  bedroomLamplight: publicMediaUrl(bedroomLamplight.url),
  bedroomDarkWood: publicMediaUrl(bedroomDarkWood.url),
  bedroomAnnexe: publicMediaUrl(bedroomAnnexe.url),
  bathroomStone: publicMediaUrl(bathroomStone.url),
  bathroomShower: publicMediaUrl(bathroomShower.url),
} as const;

export type GalleryCategory =
  | "House"
  | "Bedrooms"
  | "Living Spaces"
  | "Lake"
  | "Outdoor"
  | "Experiences";

export const galleryPhotos: {
  id: string;
  category: GalleryCategory;
  image_url: string;
  alt_text: string;
}[] = [
  {
    id: "g1",
    category: "House",
    image_url: photos.exterior,
    alt_text: "The stone round house with its thatched roof above Lake Muhazi",
  },
  {
    id: "g2",
    category: "House",
    image_url: photos.exteriorNight,
    alt_text: "The round house lit up at night",
  },
  {
    id: "g3",
    category: "House",
    image_url: photos.annexeNight,
    alt_text: "The annexe house in the evening",
  },
  {
    id: "g4",
    category: "Outdoor",
    image_url: photos.terrace,
    alt_text: "Panoramic covered terrace under the thatched roof looking over the lake",
  },
  {
    id: "g5",
    category: "Lake",
    image_url: photos.lake,
    alt_text: "View across Lake Muhazi from the property",
  },
  {
    id: "g6",
    category: "Lake",
    image_url: photos.landscape,
    alt_text: "The two houses set in the green hills of Rwamagana",
  },
  {
    id: "g7",
    category: "Living Spaces",
    image_url: photos.living,
    alt_text: "Bright curved living room with sofas and lake-facing windows",
  },
  {
    id: "g8",
    category: "Living Spaces",
    image_url: photos.livingLounge,
    alt_text: "Lounge with woven pendant lights and handcrafted wooden table",
  },
  {
    id: "g9",
    category: "Living Spaces",
    image_url: photos.livingStairs,
    alt_text: "Living area with spiral staircase to the upper floor",
  },
  {
    id: "g10",
    category: "Living Spaces",
    image_url: photos.dining,
    alt_text: "Open kitchen and dining table with root-wood base",
  },
  {
    id: "g11",
    category: "House",
    image_url: photos.thatch,
    alt_text: "Detail of the handcrafted thatched roof structure",
  },
  {
    id: "g12",
    category: "Bedrooms",
    image_url: photos.bedroomKing,
    alt_text: "King bedroom with carved wooden headboard",
  },
  {
    id: "g13",
    category: "Bedrooms",
    image_url: photos.bedroomCanopy,
    alt_text: "Bedroom with raw-wood four poster bed and mosquito net",
  },
  {
    id: "g14",
    category: "Bedrooms",
    image_url: photos.bedroomTwin,
    alt_text: "Twin bedroom with Imigongo-patterned textiles",
  },
  {
    id: "g15",
    category: "Bedrooms",
    image_url: photos.bedroomLamplight,
    alt_text: "Double bedroom with warm lamplight and hardwood floors",
  },
  {
    id: "g16",
    category: "Bedrooms",
    image_url: photos.bedroomDarkWood,
    alt_text: "Bedroom with dark hardwood bed frame and garden window",
  },
  {
    id: "g17",
    category: "Bedrooms",
    image_url: photos.bedroomAnnexe,
    alt_text: "Bedroom in the annexe house with carved door",
  },
  {
    id: "g18",
    category: "House",
    image_url: photos.bathroomStone,
    alt_text: "Bathroom with stone walls and carved wooden basin",
  },
  {
    id: "g19",
    category: "House",
    image_url: photos.bathroomShower,
    alt_text: "Walk-in rain shower with stone tiling",
  },
];
