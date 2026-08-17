import { api } from "@/lib/api";
import { LoginInput, SignupInput } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 1. Reactively subscribe to token state changes (including localStorage hydration)
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  // 2. Fetch current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/me");
      return data.user;
    },
    // Enables query automatically the moment token is read/hydrated from store
    enabled: !!token,
    // Prevents retrying 401s when token is invalid or expired
    retry: false,
  });

  // 3. Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["authUser"], data.user);
      router.push("/");
    },
  });

  // 4. Signup Mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupInput) => {
      const { data } = await api.post("/auth/signup", credentials);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["authUser"], data.user);
      router.push("/");
    },
  });

  // Return token so the Navbar can check token presence alongside loading state
  return { user, isUserLoading, token, loginMutation, signupMutation };
};
