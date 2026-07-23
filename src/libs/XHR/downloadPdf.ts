import { api } from './xhr';

export async function downloadPdf(downloadurl: string, fileName: string) {
  const blob = await api.get<Blob>(downloadurl, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
