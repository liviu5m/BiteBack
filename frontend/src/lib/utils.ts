import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const addressCache: Record<string, string> = {};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchReadableAddress = async (
  lat: number,
  lng: number,
  setReadableAddress: React.Dispatch<React.SetStateAction<string>>,
  index: number = 0) => {
  const cacheKey = `${lat},${lng}`;

  if (addressCache[cacheKey]) {
    setReadableAddress(addressCache[cacheKey]);
    return;
  }

  if (index > 0) {
    await delay(index * 1500);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BiteBackFoodSharingApp/1.0",
        },
      }
    );
    const data = await response.json();

    if (data && data.display_name) {
      const addressParts = data.address;
      const mainLocation =
        addressParts.road ||
        addressParts.suburb ||
        addressParts.city ||
        addressParts.town ||
        addressParts.village ||
        "Unknown Location";

      const cityPart = addressParts.city || addressParts.town || addressParts.state || "";

      const formattedAddress = cityPart ? `${mainLocation}, ${cityPart}` : mainLocation;

      addressCache[cacheKey] = formattedAddress;
      setReadableAddress(formattedAddress);
    } else {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setReadableAddress(fallback);
    }
  } catch (error) {
    console.error("Geocoding failed, falling back to coordinates", error);
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setReadableAddress(fallback);
  }
};
