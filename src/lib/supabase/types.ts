export type ParticipantRole = "attendee" | "speaker" | "contributor" | "organizer";
export type CertificateType = "attendance" | "speaker" | "contributor" | "organizer";
export type CertificateStatus = "valid" | "revoked";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      organizer_members: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organization_id: string | null;
          title: string;
          description: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string;
          checkin_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at: string;
          checkin_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          starts_at?: string;
          ends_at?: string;
          checkin_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string;
          role: ParticipantRole;
          checked_in_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email: string;
          role: ParticipantRole;
          checked_in_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string;
          role?: ParticipantRole;
          checked_in_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          event_id: string;
          participant_id: string;
          public_slug: string;
          certificate_type: CertificateType;
          status: CertificateStatus;
          issued_at: string;
          created_at: string;
          chain_id: string | null;
          contract_address: string | null;
          token_id: string | null;
          tx_hash: string | null;
          metadata_url: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          participant_id: string;
          public_slug: string;
          certificate_type: CertificateType;
          status?: CertificateStatus;
          issued_at?: string;
          created_at?: string;
          chain_id?: string | null;
          contract_address?: string | null;
          token_id?: string | null;
          tx_hash?: string | null;
          metadata_url?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          participant_id?: string;
          public_slug?: string;
          certificate_type?: CertificateType;
          status?: CertificateStatus;
          issued_at?: string;
          created_at?: string;
          chain_id?: string | null;
          contract_address?: string | null;
          token_id?: string | null;
          tx_hash?: string | null;
          metadata_url?: string | null;
        };
        Relationships: [];
      };
      point_ledger: {
        Row: {
          id: string;
          participant_id: string;
          event_id: string;
          action_type: string;
          points: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          event_id: string;
          action_type: string;
          points: number;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          event_id?: string;
          action_type?: string;
          points?: number;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          participant_id: string;
          badge_type: string;
          label: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          badge_type: string;
          label: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          badge_type?: string;
          label?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      participant_role: ParticipantRole;
      certificate_type: CertificateType;
      certificate_status: CertificateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
