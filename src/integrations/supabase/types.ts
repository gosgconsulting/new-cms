export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content_elements: {
        Row: {
          content_data: Json
          created_at: string
          element_id: string
          element_tag: string
          element_type: string
          id: string
          page_id: string | null
          position_data: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          content_data?: Json
          created_at?: string
          element_id: string
          element_tag: string
          element_type: string
          id?: string
          page_id?: string | null
          position_data?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          content_data?: Json
          created_at?: string
          element_id?: string
          element_tag?: string
          element_type?: string
          id?: string
          page_id?: string | null
          position_data?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_content_elements_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          ip_address: unknown | null
          submitted_at: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "cms_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_forms: {
        Row: {
          created_at: string | null
          description: string | null
          fields: Json | null
          id: string
          name: string
          status: string | null
          submissions: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          name: string
          status?: string | null
          submissions?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          name?: string
          status?: string | null
          submissions?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_global_content: {
        Row: {
          content_data: Json
          created_at: string
          element_key: string
          element_type: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          content_data?: Json
          created_at?: string
          element_key: string
          element_type: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          content_data?: Json
          created_at?: string
          element_key?: string
          element_type?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          id: string
          image: string | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          status?: string | null
          tenant_id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_schema_sections: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_editable: boolean | null
          schema_id: string
          section_definition: Json
          section_name: string
          section_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_editable?: boolean | null
          schema_id: string
          section_definition?: Json
          section_name: string
          section_type: string
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_editable?: boolean | null
          schema_id?: string
          section_definition?: Json
          section_name?: string
          section_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_schema_sections_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "cms_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_schemas: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          schema_definition: Json
          schema_name: string
          schema_type: string
          tenant_id: string
          ui_config: Json | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          schema_definition?: Json
          schema_name: string
          schema_type: string
          tenant_id?: string
          ui_config?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          schema_definition?: Json
          schema_name?: string
          schema_type?: string
          tenant_id?: string
          ui_config?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      contact_forms: {
        Row: {
          created_at: string | null
          email: string
          form_type: string | null
          id: string
          message: string
          name: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          form_type?: string | null
          id?: string
          message: string
          name: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          form_type?: string | null
          id?: string
          message?: string
          name?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_forms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          email: string
          form_id: string
          form_name: string
          id: string
          ip_address: unknown | null
          message: string | null
          name: string
          phone: string | null
          submitted_at: string
          user_agent: string | null
        }
        Insert: {
          email: string
          form_id: string
          form_name: string
          id?: string
          ip_address?: unknown | null
          message?: string | null
          name: string
          phone?: string | null
          submitted_at?: string
          user_agent?: string | null
        }
        Update: {
          email?: string
          form_id?: string
          form_name?: string
          id?: string
          ip_address?: unknown | null
          message?: string | null
          name?: string
          phone?: string | null
          submitted_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          file_url: string | null
          id: string
          is_main_file: boolean | null
          mime_type: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          file_url?: string | null
          id?: string
          is_main_file?: boolean | null
          mime_type?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          is_main_file?: boolean | null
          mime_type?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_logs: {
        Row: {
          archived: boolean | null
          category: string
          created_at: string | null
          description: string | null
          details: Json | null
          files_affected: string[] | null
          id: string
          is_system_generated: boolean | null
          severity: string
          tags: string[] | null
          tenant_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          files_affected?: string[] | null
          id?: string
          is_system_generated?: boolean | null
          severity?: string
          tags?: string[] | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          files_affected?: string[] | null
          id?: string
          is_system_generated?: boolean | null
          severity?: string
          tags?: string[] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_pages: {
        Row: {
          created_at: string | null
          html_file_id: string | null
          id: string
          is_homepage: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          path: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_file_id?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          path: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_file_id?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          path?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pages_html_file_id_fkey"
            columns: ["html_file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_settings: {
        Row: {
          active_preset: number | null
          brand_description: string | null
          component_system_rules: string | null
          created_at: string | null
          id: string
          reference_materials: string | null
          style_guidelines: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active_preset?: number | null
          brand_description?: string | null
          component_system_rules?: string | null
          created_at?: string | null
          id?: string
          reference_materials?: string | null
          style_guidelines?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active_preset?: number | null
          brand_description?: string | null
          component_system_rules?: string | null
          created_at?: string | null
          id?: string
          reference_materials?: string | null
          style_guidelines?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          original_filename: string | null
          project_type: string | null
          settings: Json | null
          status: string | null
          tenant_id: string
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          original_filename?: string | null
          project_type?: string | null
          settings?: Json | null
          status?: string | null
          tenant_id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          original_filename?: string | null
          project_type?: string | null
          settings?: Json | null
          status?: string | null
          tenant_id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sitemap_routes: {
        Row: {
          component_name: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          parent_route_id: string | null
          path: string
          sort_order: number | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          parent_route_id?: string | null
          path: string
          sort_order?: number | null
          tenant_id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          parent_route_id?: string | null
          path?: string
          sort_order?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitemap_routes_parent_route_id_fkey"
            columns: ["parent_route_id"]
            isOneToOne: false
            referencedRelation: "sitemap_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          name: string
          settings: Json | null
          status: string | null
          subdomain: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
