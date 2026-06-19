import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSession,
  readSession,
  signIn,
  signOut,
  signUp,
  User,
} from "./authApi";

export const AUTH_KEY = ["auth", "me"] as const;

export function useUser() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: getSession,
    initialData: readSession,
    staleTime: Infinity,
  });
}

export function useAuth() {
  const qc = useQueryClient();
  const { data: user, isLoading } = useUser();
  const setUser = (u: User | null) => qc.setQueryData(AUTH_KEY, u);

  const signInM = useMutation({ mutationFn: signIn, onSuccess: setUser });
  const signUpM = useMutation({ mutationFn: signUp, onSuccess: setUser });
  const signOutM = useMutation({
    mutationFn: signOut,
    onSuccess: () => setUser(null),
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    signIn: signInM.mutateAsync,
    signUp: signUpM.mutateAsync,
    signOut: signOutM.mutateAsync,
    signingIn: signInM.isPending,
    signingUp: signUpM.isPending,
    signInError: signInM.error as Error | null,
    signUpError: signUpM.error as Error | null,
  };
}
