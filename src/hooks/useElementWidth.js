import { useCallback, useState } from 'react';

// Mede a largura de um elemento e atualiza quando ela muda
// (janela redimensionada, sidebar empilhando no celular...).
// Uso: const [ref, width] = useElementWidth();  <div ref={ref}>
export function useElementWidth() {
  const [width, setWidth] = useState(null);

  const ref = useCallback((node) => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
