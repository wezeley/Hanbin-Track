import { useEffect, useState } from 'react';

// O endereço da tela fica depois do # (.../Hanbin-Track/#/group/SKZ): assim o
// GitHub Pages sempre entrega o mesmo index.html, e o F5, o botão voltar e os
// links compartilhados funcionam.
const readPath = () => window.location.hash.replace(/^#/, '') || '/';

// Uso: const path = useHashRoute();  ->  "/group/SKZ"
// Atualiza sozinho quando o endereço muda (clique, voltar, avançar).
export function useHashRoute() {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

// Vai para outra tela: muda o endereço, e o useHashRoute avisa o App.
export const navigate = (path) => {
  window.location.hash = path;
};
