import { ReactNode } from "react";

type QueryStateProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  children: ReactNode;
};

export function QueryState({ loading, error, empty, emptyText, children }: QueryStateProps) {
  if (loading) {
    return <p className="px-6 py-8 text-stone-500">Carregando...</p>;
  }
  if (error) {
    return <p className="px-6 py-8 text-stone-700">{error}</p>;
  }
  if (empty) {
    return <p className="px-6 py-8 text-stone-500">{emptyText}</p>;
  }
  return <>{children}</>;
}
