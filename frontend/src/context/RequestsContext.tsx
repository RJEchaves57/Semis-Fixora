import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";
import type { Media, Priority, RequestItem, Session } from "../types";

export type NewRequestInput = {
  title: string;
  description: string;
  category: string;
  location: string;
  priority: Priority;
  images: Media[];
  video: Media | null;
  requesterId: string;
  requester: string;
};

type Ctx = {
  requests: RequestItem[];
  staff: Session[];
  loading: boolean;
  addRequest: (input: NewRequestInput) => Promise<RequestItem>;
  approve: (id: string) => Promise<void>;
  decline: (id: string, reason: string) => Promise<void>;
  assign: (id: string, staffId: string) => Promise<void>;
  updateProgress: (
    id: string,
    status: "In Progress" | "Resolved",
  ) => Promise<void>;
  refresh: () => Promise<void>;
};

const RequestsContext = createContext<Ctx | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [staff, setStaff] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setStaff([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<RequestItem[]>("/requests");
      setRequests(result);

      if (user.role === "admin") {
        const staffResult = await apiFetch<Session[]>("/staff");
        setStaff(staffResult);
      } else {
        setStaff([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRequests([]);
      setStaff([]);
      setLoading(false);
      return;
    }

    refresh().catch((error) => {
      console.error("Unable to load Fixora requests:", error);
    });
  }, [user, authLoading, refresh]);

  const addRequest: Ctx["addRequest"] = async (input) => {
    const formData = new FormData();

    formData.append("title", input.title);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("location", input.location);
    formData.append("priority", input.priority);

    input.images.forEach((media, index) => {
      if (media.file) {
        formData.append(`images[${index}]`, media.file);
      }
    });

    if (input.video?.file) {
      formData.append("video", input.video.file);
    }

    const created = await apiFetch<RequestItem>("/requests", {
      method: "POST",
      body: formData,
    });

    await refresh();
    return created;
  };

  const approve: Ctx["approve"] = async (id) => {
    await apiFetch(`/requests/${encodeURIComponent(id)}/approve`, {
      method: "POST",
    });
    await refresh();
  };

  const decline: Ctx["decline"] = async (id, reason) => {
    await apiFetch(`/requests/${encodeURIComponent(id)}/decline`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    await refresh();
  };

  const assign: Ctx["assign"] = async (id, staffId) => {
    await apiFetch(`/requests/${encodeURIComponent(id)}/assign`, {
      method: "POST",
      body: JSON.stringify({ staff_id: Number(staffId) }),
    });
    await refresh();
  };

  const updateProgress: Ctx["updateProgress"] = async (id, status) => {
    const endpoint = status === "In Progress" ? "start" : "resolve";

    await apiFetch(`/requests/${encodeURIComponent(id)}/${endpoint}`, {
      method: "POST",
    });

    await refresh();
  };

  return (
    <RequestsContext.Provider
      value={{
        requests,
        staff,
        loading,
        addRequest,
        approve,
        decline,
        assign,
        updateProgress,
        refresh,
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRequests() {
  const context = useContext(RequestsContext);

  if (!context) {
    throw new Error("useRequests must be used inside RequestsProvider");
  }

  return context;
}
