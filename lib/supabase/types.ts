export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type UserRole =
  | "admin"
  | "station_manager"
  | "supervisor"
  | "agent"
  | "airline_client";
