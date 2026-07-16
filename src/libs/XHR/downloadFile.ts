import { xhr } from "./xhr";

export async function downloadFile(
  downloadUrl: string,
  fileName?: string,
  body?: unknown,
) {
  const blob = (await xhr.post(downloadUrl, body, {
    responseType: "blob",
  })) as Blob;

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = fileName || "data.xlsx";

  document.body.appendChild(a);

  a.click();

  a.remove();

  window.URL.revokeObjectURL(url);
}
