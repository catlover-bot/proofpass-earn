export type ParticipantRole = "attendee" | "speaker" | "contributor" | "organizer";
export type EventCheckinMode = "public" | "invite_only";
export type CertificateType =
  | "attendance"
  | "speaking"
  | "contribution"
  | "organizing"
  | "speaker"
  | "contributor"
  | "organizer";
export type CertificateStatus = "valid" | "revoked";
export type CertificateVerificationLevel = "checkin" | "organizer_approved" | "evidence_verified" | "onchain_sbt";
export type CertificateApprovalStatus = "approved" | "pending" | "rejected";

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
          user_id: string | null;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          email: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
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
          checkin_mode: EventCheckinMode;
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
          checkin_mode?: EventCheckinMode;
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
          checkin_mode?: EventCheckinMode;
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
          verification_level: CertificateVerificationLevel;
          approval_status: CertificateApprovalStatus;
          status: CertificateStatus;
          issued_at: string;
          created_at: string;
          chain_id: number | string | null;
          chain_name: string | null;
          contract_address: string | null;
          token_id: string | null;
          tx_hash: string | null;
          metadata_url: string | null;
          token_uri: string | null;
          minted_at: string | null;
          sbt_status: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          participant_id: string;
          public_slug: string;
          certificate_type: CertificateType;
          verification_level?: CertificateVerificationLevel;
          approval_status?: CertificateApprovalStatus;
          status?: CertificateStatus;
          issued_at?: string;
          created_at?: string;
          chain_id?: number | string | null;
          chain_name?: string | null;
          contract_address?: string | null;
          token_id?: string | null;
          tx_hash?: string | null;
          metadata_url?: string | null;
          token_uri?: string | null;
          minted_at?: string | null;
          sbt_status?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          participant_id?: string;
          public_slug?: string;
          certificate_type?: CertificateType;
          verification_level?: CertificateVerificationLevel;
          approval_status?: CertificateApprovalStatus;
          status?: CertificateStatus;
          issued_at?: string;
          created_at?: string;
          chain_id?: number | string | null;
          chain_name?: string | null;
          contract_address?: string | null;
          token_id?: string | null;
          tx_hash?: string | null;
          metadata_url?: string | null;
          token_uri?: string | null;
          minted_at?: string | null;
          sbt_status?: string | null;
        };
        Relationships: [];
      };
      event_invitations: {
        Row: {
          id: string;
          event_id: string;
          email: string;
          normalized_email: string;
          name: string | null;
          role: ParticipantRole | null;
          invite_token: string;
          status: string;
          invited_at: string;
          checked_in_at: string | null;
          participant_id: string | null;
          certificate_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          email: string;
          normalized_email: string;
          name?: string | null;
          role?: ParticipantRole | null;
          invite_token: string;
          status?: string;
          invited_at?: string;
          checked_in_at?: string | null;
          participant_id?: string | null;
          certificate_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          email?: string;
          normalized_email?: string;
          name?: string | null;
          role?: ParticipantRole | null;
          invite_token?: string;
          status?: string;
          invited_at?: string;
          checked_in_at?: string | null;
          participant_id?: string | null;
          certificate_id?: string | null;
          created_at?: string;
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
    Views: {
      community_public_organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Relationships: [];
      };
      community_public_events: {
        Row: {
          id: string;
          organization_id: string | null;
          title: string;
          starts_at: string;
          checkin_code: string;
          checkin_mode: EventCheckinMode;
          participant_count: number;
          proof_count: number;
        };
        Relationships: [];
      };
      community_public_proofs: {
        Row: {
          id: string;
          organization_id: string | null;
          event_title: string;
          public_slug: string;
          participant_name: string;
          proof_label: string | null;
          certificate_type: CertificateType;
          verification_level: CertificateVerificationLevel;
          approval_status: CertificateApprovalStatus;
          issued_at: string;
        };
        Relationships: [];
      };
      community_public_label_counts: {
        Row: {
          organization_id: string | null;
          proof_label: string;
          proof_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      participant_role: ParticipantRole;
      certificate_type: CertificateType;
      certificate_status: CertificateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
