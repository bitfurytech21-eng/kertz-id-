/**
 * Safe download utility avoiding window.open popup blockers in sandboxed iframes
 */
export function safeDownload(data: string | Blob, filename?: string) {
  try {
    const link = document.createElement('a');
    const url = typeof data === 'string' ? data : URL.createObjectURL(data);
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (typeof data !== 'string') {
        URL.revokeObjectURL(url);
      }
    }, 500);
  } catch (err) {
    console.error('Safe download error:', err);
  }
}
