export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "active" | "suspended";
export type ListingKind = "sell" | "rent" | "giveaway" | "wanted";
export type ListingStatus = "active" | "reserved" | "closed" | "removed";
export type ItemCondition = "new" | "like_new" | "good" | "fair";
export type RentPeriod = "day" | "week" | "month";
export type InterestStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type ReportTarget = "listing" | "user";
export type ReportStatus = "open" | "dismissed" | "actioned";
export type ReportReason =
  | "spam"
  | "prohibited_item"
  | "scam"
  | "harassment"
  | "other";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: never;
          slug: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: never;
          slug?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          batch: string | null;
          role: UserRole;
          status: UserStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          batch?: string | null;
          role?: UserRole;
          status?: UserStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          batch?: string | null;
          role?: UserRole;
          status?: UserStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_contacts: {
        Row: {
          user_id: string;
          whatsapp: string | null;
          block: string | null;
        };
        Insert: {
          user_id: string;
          whatsapp?: string | null;
          block?: string | null;
        };
        Update: {
          user_id?: string;
          whatsapp?: string | null;
          block?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_contacts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      access_codes: {
        Row: {
          code: string;
          label: string;
          max_uses: number;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          code: string;
          label: string;
          max_uses?: number;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          label?: string;
          max_uses?: number;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          kind: ListingKind;
          title: string;
          description: string;
          category_id: number | null;
          price: number | null;
          rent_period: RentPeriod | null;
          deposit: number | null;
          condition: ItemCondition | null;
          pickup_area: string | null;
          image_paths: string[];
          status: ListingStatus;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          kind: ListingKind;
          title: string;
          description?: string;
          category_id?: number | null;
          price?: number | null;
          rent_period?: RentPeriod | null;
          deposit?: number | null;
          condition?: ItemCondition | null;
          pickup_area?: string | null;
          image_paths?: string[];
          status?: ListingStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          kind?: ListingKind;
          title?: string;
          description?: string;
          category_id?: number | null;
          price?: number | null;
          rent_period?: RentPeriod | null;
          deposit?: number | null;
          condition?: ItemCondition | null;
          pickup_area?: string | null;
          image_paths?: string[];
          status?: ListingStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      interests: {
        Row: {
          id: string;
          listing_id: string;
          requester_id: string;
          message: string;
          status: InterestStatus;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          requester_id: string;
          message?: string;
          status?: InterestStatus;
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          listing_id?: string;
          requester_id?: string;
          message?: string;
          status?: InterestStatus;
          created_at?: string;
          responded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interests_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          listing_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          listing_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          listing_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target: ReportTarget;
          listing_id: string | null;
          reported_user_id: string | null;
          reason: ReportReason;
          details: string | null;
          status: ReportStatus;
          handled_by: string | null;
          handled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target: ReportTarget;
          listing_id?: string | null;
          reported_user_id?: string | null;
          reason: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          handled_by?: string | null;
          handled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target?: ReportTarget;
          listing_id?: string | null;
          reported_user_id?: string | null;
          reason?: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          handled_by?: string | null;
          handled_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey";
            columns: ["reported_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_handled_by_fkey";
            columns: ["handled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_set_user_status: {
        Args: {
          p_user: string;
          p_status: UserStatus;
        };
        Returns: undefined;
      };
      admin_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      can_see_contact: {
        Args: {
          p_user: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_member: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      redeem_access_code: {
        Args: {
          p_code: string;
          p_full_name: string;
          p_batch: string;
          p_whatsapp?: string | null;
          p_block?: string | null;
        };
        Returns: undefined;
      };
      respond_to_interest: {
        Args: {
          p_interest_id: string;
          p_accept: boolean;
        };
        Returns: undefined;
      };
      withdraw_interest: {
        Args: {
          p_interest_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      listing_kind: ListingKind;
      listing_status: ListingStatus;
      item_condition: ItemCondition;
      rent_period: RentPeriod;
      interest_status: InterestStatus;
      report_target: ReportTarget;
      report_status: ReportStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
