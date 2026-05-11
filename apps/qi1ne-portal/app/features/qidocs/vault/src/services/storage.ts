import { SupabaseClient } from '@supabase/supabase-js';
import { IBlobStore } from '../types';

export class SupabaseStorageBlobStore implements IBlobStore {
    constructor(
        private supabase: SupabaseClient,
        private bucketName: string = 'qivault-blobs'
    ) { }

    async upload(file: File | Buffer, path: string, meta: { mimeType: string }) {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(path, file, {
                contentType: meta.mimeType,
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(data.path);

        return { key: data.path, publicUrl };
    }

    async download(key: string) {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .download(key);

        if (error) throw error;
        return data;
    }

    async delete(key: string) {
        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .remove([key]);

        if (error) throw error;
    }

    async getSignedUrl(key: string, expiresIn: number = 3600) {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .createSignedUrl(key, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    }
}

// Stubs for other backends
export class R2BlobStore implements IBlobStore {
    async upload() { throw new Error('R2 Not Implemented'); return { key: '', publicUrl: '' }; }
    async download() { throw new Error('R2 Not Implemented'); }
    async delete() { throw new Error('R2 Not Implemented'); }
    async getSignedUrl() { throw new Error('R2 Not Implemented'); }
}

export class DriveBlobStore implements IBlobStore {
    async upload() { throw new Error('Drive Not Implemented'); return { key: '', publicUrl: '' }; }
    async download() { throw new Error('Drive Not Implemented'); }
    async delete() { throw new Error('Drive Not Implemented'); }
    async getSignedUrl() { throw new Error('Drive Not Implemented'); }
}
