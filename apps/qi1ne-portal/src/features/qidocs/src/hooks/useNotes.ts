/**
 * QiNote v2.0 - React Query Hooks for Notes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, ingestApi, queryApi, noteAssistApi } from '../lib/api';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  IngestRequest,
  QueryRequest,
  NoteAssistRequest,
} from '../types/note';

// Notes queries
export function useNotesList(params?: { realm?: string; tag?: string; q?: string }) {
  return useQuery({
    queryKey: ['notes', 'list', params],
    queryFn: () => notesApi.list(params),
  });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: () => notesApi.get(id!),
    enabled: !!id,
  });
}

// Notes mutations
export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNoteRequest) => notesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      notesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'list'] });
    },
  });
}

// Ingestion
export function useIngestNote() {
  return useMutation({
    mutationFn: (data: IngestRequest) => ingestApi.ingest(data),
  });
}

export function useIngestStatus(ingestionId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['ingest', ingestionId],
    queryFn: () => ingestApi.getStatus(ingestionId!),
    enabled: enabled && !!ingestionId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is queued or processing
      const data = query.state.data;
      if (data?.status === 'queued' || data?.status === 'processing') {
        return 2000;
      }
      return false;
    },
  });
}

// Query / Search
export function useQueryNotes(data: QueryRequest) {
  return useQuery({
    queryKey: ['query', data],
    queryFn: () => queryApi.query(data),
    enabled: !!data.query || !!data.query_note_id,
  });
}

export function useRelatedNotes(noteId: string | null) {
  return useQuery({
    queryKey: ['related', noteId],
    queryFn: () => queryApi.query({ query_note_id: noteId!, mode: 'related' }),
    enabled: !!noteId,
  });
}

// Note Assist
export function useNoteAssist() {
  return useMutation({
    mutationFn: (data: NoteAssistRequest) => noteAssistApi.assist(data),
  });
}

