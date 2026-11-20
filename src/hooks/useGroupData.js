import { useEffect, useState } from 'react';
import { loadGroup } from '../data/groups';

// Carrega o arquivo do grupo quando a página dele abre.
// Uso: const { data, error } = useGroupData('SKZ');
// Enquanto carrega, data e error são null.
export function useGroupData(code) {
  const [result, setResult] = useState({ code: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false; // se trocar de grupo antes de terminar, ignora o resultado antigo
    loadGroup(code)
      .then(data => { if (!cancelled) setResult({ code, data, error: null }); })
      .catch(error => { if (!cancelled) setResult({ code, data: null, error }); });
    return () => { cancelled = true; };
  }, [code]);

  // Resultado de outro grupo (o anterior) conta como "carregando".
  if (result.code !== code) return { data: null, error: null };
  return result;
}
