import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const formData = await req.formData()
        const file = formData.get('file') as File
        const tenant_id = formData.get('tenant_id') as string

        if (!file) {
            throw new Error('No file uploaded')
        }

        // 1. Compute Integrity
        const arrayBuffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
        const fileSize = file.size

        // 2. Generate Deterministic Key
        // /{tenant_id}/{yyyy}/{mm}/{doc_id}/{file_id}/{variant}
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const doc_id = crypto.randomUUID()
        const file_id = crypto.randomUUID()
        const blobKey = `${tenant_id}/${yyyy}/${mm}/${doc_id}/${file_id}/original`

        // 3. Store Blob
        const { data: storageData, error: storageError } = await supabaseClient.storage
            .from('qivault-blobs')
            .upload(blobKey, arrayBuffer, {
                contentType: file.type,
                upsert: false
            })

        if (storageError) throw storageError

        // 4. Insert Atomic DB Rows
        const { data: docData, error: docError } = await supabaseClient
            .from('documents')
            .insert({
                id: doc_id,
                tenant_id,
                title: file.name,
                status: 'inbox'
            })
            .select()
            .single()

        if (docError) throw docError

        const { data: fileData, error: fileError } = await supabaseClient
            .from('document_files')
            .insert({
                id: file_id,
                document_id: doc_id,
                file_name: file.name,
                variant: 'original',
                mime_type: file.type,
                file_size: fileSize,
                sha256,
                blob_key: blobKey,
                storage_backend: 'supabase'
            })

        return new Response(
            JSON.stringify({ document_id: doc_id, file_id: file_id, sha256 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
