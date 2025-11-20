export function compressImage(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function saveToHistory(result: any) {
  const history = getHistory();
  history.unshift(result);
  localStorage.setItem('ai-lab-history', JSON.stringify(history.slice(0, 50)));
}

export function getHistory(): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ai-lab-history');
  return data ? JSON.parse(data) : [];
}

export function clearHistory() {
  localStorage.removeItem('ai-lab-history');
}
