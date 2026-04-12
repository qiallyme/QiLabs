import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase/client';
import { ChatShell } from './features/chat';
import { getUserRooms } from './features/chat/lib/queries';
import { createRoom } from './features/chat/lib/mutations';
import type { Database } from './types/database.types';

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];

function App() {
    const [session, setSession] = useState<any>(null);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session) {
            loadRooms();
        }
    }, [session]);

    const loadRooms = async () => {
        try {
            const userRooms = await getUserRooms();
            setRooms(userRooms);
            if (userRooms.length > 0 && !activeRoomId) {
                setActiveRoomId(userRooms[0].id);
            }
        } catch (error) {
            console.error('Failed to load rooms:', error);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert(error.message);
        else alert('Check your email for the login link!');
        setLoading(false);
    };

    const handleCreateRoom = async () => {
        const name = prompt('Enter a name for the new chat room:');
        if (!name) return;
        try {
            const newRoom = await createRoom(name);
            await loadRooms();
            setActiveRoomId(newRoom.id);
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Could not create room. Check console for details.');
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
    }

    // --- LAYER 1: AUTHENTICATION ---
    if (!session) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white p-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4 p-6 border border-gray-800 rounded-xl bg-gray-900/50">
                    <h2 className="text-xl font-bold">Sign In</h2>
                    <p className="text-sm text-gray-400">Enter your email to receive a magic link.</p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                    <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors">
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>
            </div>
        );
    }

    // --- LAYER 2: ROOM SELECTION / CHAT HOST ---
    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-white">
            {/* Sidebar for Room Navigation */}
            <div className="w-64 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold">Your Rooms</h2>
                    <button onClick={handleCreateRoom} className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                        + New
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {rooms.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">No rooms yet.</p>
                    ) : (
                        rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoomId(room.id)}
                                className={`w-full text-left px-3 py-2 rounded transition-colors ${activeRoomId === room.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800 text-gray-300'
                                    }`}
                            >
                                # {room.name}
                            </button>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-800 text-sm text-gray-500 truncate">
                    Logged in as: {session.user.email}
                    <button onClick={() => supabase.auth.signOut()} className="ml-2 text-red-500 hover:text-red-400">
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col p-4 sm:p-6">
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-800 bg-black/50 shadow-2xl relative">
                    {activeRoomId ? (
                        <ChatShell roomId={activeRoomId} currentUserId={session.user.id} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            Select or create a room to start chatting.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;