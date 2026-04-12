import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { caseId, caseType, caseTitle } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });
    }

    // 1. Construct the prompt for the Legal AI
    const systemPrompt = `
      You are an expert Legal Project Manager AI. 
      Your goal is to break down a legal case into actionable, clear tasks for a self-represented litigant.
      
      Output JSON format ONLY:
      [
        { "title": "Task Name", "priority": "High" | "Medium" | "Low", "due_offset_days": number (estimated days from today) }
      ]
    `;

    const userPrompt = `
      Create a 5-step initial checklist for a "${caseType}" case titled "${caseTitle}".
      Focus on immediate procedural steps required in US Civil Court (e.g., filing proof of service, responding to discovery).
    `;

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }, // Ensures valid JSON
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{"tasks": []}');
    const suggestedTasks = aiResponse.tasks || [];

    // 3. (Optional) Automatically save these to the database
    // This allows the UI to simply re-fetch the task list
    if (suggestedTasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(
        suggestedTasks.map((task: any) => ({
          case_id: caseId,
          title: task.title,
          priority: task.priority,
          status: 'Todo',
          // Simple mock date calculation
          due_date: new Date(Date.now() + task.due_offset_days * 86400000).toISOString(), 
        }))
      );

      if (error) throw error;
    }

    return NextResponse.json({ success: true, tasks: suggestedTasks });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}