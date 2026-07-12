import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchReadableAddress = async (lat: number, lng: number, setReadableAddress: React.Dispatch<React.SetStateAction<string>>) => {

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
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

      setReadableAddress(cityPart ? `${mainLocation}, ${cityPart}` : mainLocation);
    } else {
      setReadableAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  } catch {
    setReadableAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }
};
