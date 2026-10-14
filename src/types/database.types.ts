export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventStatus = 'draft' | 'drawn' | 'completed' | 'cancelled';
export type EmailType = 'assignment_reveal' | 'reminder' | 'wishlist_updated';
export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string | null;
          budget_amount: number | null;
          budget_currency: string;
          exchange_date: string | null;
          location: string | null;
          status: EventStatus;
          allow_wishlists: boolean;
          is_premium: boolean;
          drawn_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description?: string | null;
          budget_amount?: number | null;
          budget_currency?: string;
          exchange_date?: string | null;
          location?: string | null;
          status?: EventStatus;
          allow_wishlists?: boolean;
          is_premium?: boolean;
          drawn_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string | null;
          budget_amount?: number | null;
          budget_currency?: string;
          exchange_date?: string | null;
          location?: string | null;
          status?: EventStatus;
          allow_wishlists?: boolean;
          is_premium?: boolean;
          drawn_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          name: string;
          email: string;
          invite_token: string;
          has_viewed_assignment: boolean;
          viewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string | null;
          name: string;
          email: string;
          invite_token?: string;
          has_viewed_assignment?: boolean;
          viewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          invite_token?: string;
          has_viewed_assignment?: boolean;
          viewed_at?: string | null;
          created_at?: string;
        };
      };
      pair_restrictions: {
        Row: {
          id: string;
          event_id: string;
          giver_participant_id: string;
          restricted_receiver_participant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          giver_participant_id: string;
          restricted_receiver_participant_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          giver_participant_id?: string;
          restricted_receiver_participant_id?: string;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          event_id: string;
          giver_id: string;
          receiver_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          giver_id: string;
          receiver_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          giver_id?: string;
          receiver_id?: string;
          created_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          participant_id: string;
          notes: string | null;
          clothing_sizes: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          notes?: string | null;
          clothing_sizes?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          notes?: string | null;
          clothing_sizes?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          title: string;
          url: string | null;
          estimated_price: number | null;
          priority: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          title: string;
          url?: string | null;
          estimated_price?: number | null;
          priority?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          title?: string;
          url?: string | null;
          estimated_price?: number | null;
          priority?: number;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          event_id: string;
          participant_id: string;
          resend_email_id: string | null;
          type: EmailType;
          status: EmailStatus;
          error_message: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          participant_id: string;
          resend_email_id?: string | null;
          type: EmailType;
          status?: EmailStatus;
          error_message?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          participant_id?: string;
          resend_email_id?: string | null;
          type?: EmailType;
          status?: EmailStatus;
          error_message?: string | null;
          sent_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          profile_id: string;
          event_id: string | null;
          stripe_session_id: string;
          stripe_payment_intent: string | null;
          amount_cents: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_id?: string | null;
          stripe_session_id: string;
          stripe_payment_intent?: string | null;
          amount_cents: number;
          currency?: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_id?: string | null;
          stripe_session_id?: string;
          stripe_payment_intent?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}
