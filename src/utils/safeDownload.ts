/**
 * Safe download utility avoiding window.open popup blockers in sandboxed iframes
 */
export function safeDownload(url: string, filename?: string) {
  try {
    const link = document.createElement('a');
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
    }, 150);
  } catch (err) {
    console.error('Safe download error:', err);
  }
}
