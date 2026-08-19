import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "estatesrw_manager" | "operations_staff";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });
}

export function useRoles() {
  const { data: user } = useSession();
  return useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

export function useAccess() {
  const { data: roles, isLoading } = useRoles();
  const list = roles ?? [];
  return {
    isLoading,
    roles: list,
    hasAccess: list.length > 0,
    isOwner: list.includes("owner"),
    canManage: list.includes("owner") || list.includes("estatesrw_manager"),
    canSeeFinancials: list.includes("owner") || list.includes("estatesrw_manager"),
    isOps: list.includes("operations_staff"),
  };
}

export function usePropertyId() {
  return useQuery({
    queryKey: ["dashboard-property"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,name,currency,max_guests,bedrooms")
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
