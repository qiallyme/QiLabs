export type DocumentStatus = 'inbox' | 'curated' | 'archived' | 'trash';

export interface QiVaultDocument {
    id: string;
    tenant_id: string;
    title: string;
    document_date: string | null;
    correspondent_id: string | null;
    status: DocumentStatus;
    direction: 'incoming' | 'outgoing' | null;
    notes: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    tags?: QiVaultTag[];
    files?: QiVaultFile[];
}

export type FileVariant = 'original' | 'ocr_pdf' | 'extracted_text' | 'thumbnail' | 'preview_jpg';

export interface QiVaultFile {
    id: string;
    document_id: string;
    file_name: string;
    variant: FileVariant;
    mime_type: string | null;
    file_size: number;
    sha256: string;
    storage_backend: 'supabase' | 'r2' | 'gdrive';
    blob_key: string;
    integrity_status: 'verified' | 'corrupt' | 'missing';
    last_verified_at: string | null;
    created_at: string;
}

export interface QiVaultTag {
    id: string;
    tenant_id: string;
    name: string;
    category: string | null;
    color: string | null;
}

export interface Correspondent {
    id: string;
    tenant_id: string;
    name: string;
    type: 'person' | 'organization';
    notes: string | null;
}

/**
 * Storage Abstraction
 */
export interface IBlobStore {
    upload(
        file: File | Buffer,
        path: string,
        meta: { mimeType: string }
    ): Promise<{ key: string; publicUrl: string }>;

    download(key: string): Promise<Blob>;

    delete(key: string): Promise<void>;

    getSignedUrl(key: string, expiresIn: number): Promise<string>;
}
