export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            content_index: {
                Row: {
                    canonical_name: string
                    content_hash: string
                    dna_id: string
                    indexed_at: string | null
                    module: string
                    slug: string | null
                    source_path: string
                    source_sha: string | null
                    status: string
                    tags: string[] | null
                    title: string
                    type: string
                    version: number | null
                    visibility: string
                }
                Insert: {
                    canonical_name: string
                    content_hash: string
                    dna_id: string
                    indexed_at?: string | null
                    module: string
                    slug?: string | null
                    source_path: string
                    source_sha?: string | null
                    status: string
                    tags?: string[] | null
                    title: string
                    type: string
                    version?: number | null
                    visibility: string
                }
                Update: {
                    canonical_name?: string
                    content_hash?: string
                    dna_id?: string
                    indexed_at?: string | null
                    module?: string
                    slug?: string | null
                    source_path?: string
                    source_sha?: string | null
                    status?: string
                    tags?: string[] | null
                    title?: string
                    type?: string
                    version?: number | null
                    visibility?: string
                }
                Relationships: []
            }
            tenant_llm_configs: {
                Row: {
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    provider: string
                    tenant_id: string
                    updated_at: string | null
                    vault_secret_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    provider: string
                    tenant_id: string
                    updated_at?: string | null
                    vault_secret_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    provider?: string
                    tenant_id?: string
                    updated_at?: string | null
                    vault_secret_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_llm_configs_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_members: {
                Row: {
                    created_at: string | null
                    id: string
                    role: Database["public"]["Enums"]["user_role"] | null
                    tenant_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    tenant_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    tenant_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_members_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenant_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenants: {
                Row: {
                    created_at: string | null
                    id: string
                    metadata: Json | null
                    name: string
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    name: string
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    name?: string
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    display_name: string | null
                    email: string
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email: string
                    id: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email?: string
                    id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            active_llm_providers: {
                Row: {
                    is_active: boolean | null
                    provider: string | null
                    tenant_id: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_llm_configs_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Functions: {
            [_: string]: never
        }
        Enums: {
            user_role: "owner" | "admin" | "editor" | "viewer"
        }
        CompositeTypes: {
            [_: string]: never
        }
    }
}
