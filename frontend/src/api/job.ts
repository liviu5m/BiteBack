import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL

export async function getJobStatus(jobId: string) {
  const response = await axios.get(`${baseUrl}/api/job/${jobId}`, { withCredentials: true });
  return response.data;
}
