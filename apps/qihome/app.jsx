import React, { useMemo, useState } from "react";
import { Home, BookOpen, CheckSquare, CalendarDays, ClipboardList, ShoppingCart, PawPrint, Car, Users, Bell, Search, Plus, Filter, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const members = [
    { id: "cody", name: "Cody", role: "IT / Legal / Admin" },
    { id: "mom", name: "Mom", role: "Bills / Groceries / Meal Prep" },
    { id: "zai", name: "Zai", role: "Vehicles / Maintenance / Gigi" },
];

const initialWiki = [
    { id: 1, title: "Household Agreement", category: "Rules", content: "Core living agreement, roles, boundaries, and shared expectations." },
    { id: 2, title: "Emergency Contacts", category: "Safety", content: "911, apartment office, maintenance, utilities, vet, hospital." },
    { id: 3, title: "Gigi Care Guide", category: "Pet Care", content: "Feeding times, walk expectations, vet info, meds, notes." },
];

const initialTasks = [
    { id: 1, title: "Take out trash", assignee: "zai", due: "2026-03-29", recurring: "Weekly", status: "Open", priority: "Medium", category: "Chore" },
    { id: 2, title: "Update household docs", assignee: "cody", due: "2026-03-30", recurring: "None", status: "Open", priority: "Low", category: "Admin" },
    { id: 3, title: "Meal prep for week", assignee: "mom", due: "2026-03-30", recurring: "Weekly", status: "Open", priority: "High", category: "Meals" },
];

const initialRequests = [
    { id: 1, title: "Check tire pressure", from: "mom", to: "zai", status: "Open", type: "Vehicle", notes: "Front left feels low." },
    { id: 2, title: "Fix printer / wifi issue", from: "mom", to: "cody", status: "Open", type: "IT", notes: "Printer dropped off network." },
];

const initialEvents = [
    { id: 1, title: "Household Meeting", date: "2026-04-01", type: "Meeting", owner: "cody" },
    { id: 2, title: "Electric bill due", date: "2026-04-10", type: "Bill", owner: "mom" },
    { id: 3, title: "Gigi vet reminder", date: "2026-04-15", type: "Pet", owner: "zai" },
];

const initialMeals = [
    { id: 1, day: "Monday", meal: "Chicken bowls", prepBy: "mom", notes: "Lunch + dinner leftovers" },
    { id: 2, day: "Wednesday", meal: "Pasta bake", prepBy: "mom", notes: "Double batch" },
];

const initialShopping = [
    { id: 1, item: "Paper towels", qty: "2", category: "Household", checked: false },
    { id: 2, item: "Dog food", qty: "1 bag", category: "Pet", checked: false },
    { id: 3, item: "Chicken breast", qty: "5 lb", category: "Groceries", checked: true },
];

const initialPets = [
    { id: 1, task: "Morning feed", assignedTo: "zai", time: "08:00", done: false },
    { id: 2, task: "Evening walk", assignedTo: "zai", time: "18:00", done: false },
];

const initialVehicles = [
    { id: 1, vehicle: "Main Car", bookedBy: "zai", date: "2026-03-31", purpose: "Errands / service", status: "Booked" },
    { id: 2, vehicle: "Main Car", bookedBy: "mom", date: "2026-04-02", purpose: "Groceries", status: "Planned" },
];

function memberName(id) {
    return members.find((m) => m.id === id)?.name || id;
}

function SectionHeader({ title, description, action }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}

function StatCard({ title, value, hint, icon: Icon }) {
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="mt-2 text-3xl font-bold">{value}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
                    </div>
                    <div className="rounded-2xl border p-3">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AddItemDialog({ triggerLabel, title, fields, onSubmit }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""])));

    const reset = () => setForm(Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ""])));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" />{triggerLabel}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    {fields.map((field) => (
                        <div key={field.name} className="grid gap-2">
                            <label className="text-sm font-medium">{field.label}</label>
                            {field.type === "textarea" ? (
                                <Textarea value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
                            ) : field.type === "select" ? (
                                <Select value={form[field.name]} onValueChange={(value) => setForm({ ...form, [field.name]: value })}>
                                    <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input type={field.type || "text"} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" className="rounded-2xl" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
                        <Button className="rounded-2xl" onClick={() => {
                            onSubmit(form);
                            reset();
                            setOpen(false);
                        }}>Save</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function NorthbendHomeHubApp() {
    const [active, setActive] = useState("home");
    const [search, setSearch] = useState("");
    const [wiki, setWiki] = useState(initialWiki);
    const [tasks, setTasks] = useState(initialTasks);
    const [requests, setRequests] = useState(initialRequests);
    const [events, setEvents] = useState(initialEvents);
    const [meals, setMeals] = useState(initialMeals);
    const [shopping, setShopping] = useState(initialShopping);
    const [petTasks, setPetTasks] = useState(initialPets);
    const [vehicles, setVehicles] = useState(initialVehicles);

    const overdueTasks = tasks.filter((t) => t.status !== "Done").length;
    const openRequests = requests.filter((r) => r.status !== "Closed").length;
    const dueSoon = events.length;
    const shoppingOpen = shopping.filter((s) => !s.checked).length;

    const menu = [
        { id: "home", label: "Home", icon: Home },
        { id: "wiki", label: "Library", icon: BookOpen },
        { id: "tasks", label: "Tasks", icon: CheckSquare },
        { id: "requests", label: "Requests", icon: ClipboardList },
        { id: "calendar", label: "Calendar", icon: CalendarDays },
        { id: "meals", label: "Meals", icon: FileText },
        { id: "shopping", label: "Shopping", icon: ShoppingCart },
        { id: "gigi", label: "Gigi", icon: PawPrint },
        { id: "vehicles", label: "Vehicles", icon: Car },
        { id: "members", label: "Members", icon: Users },
    ];

    const filteredWiki = useMemo(() => {
        if (!search) return wiki;
        return wiki.filter((w) => `${w.title} ${w.category} ${w.content}`.toLowerCase().includes(search.toLowerCase()));
    }, [wiki, search]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
                <aside className="border-r bg-muted/30 p-4">
                    <div className="rounded-3xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border p-3"><Home className="h-5 w-5" /></div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Northbend</p>
                                <h1 className="text-lg font-bold">Home Hub</h1>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">Household ops dashboard for Cody, Mom, and Zai.</p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {menu.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActive(id)}
                                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active === id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{label}</span>
                            </button>
                        ))}
                    </div>

                    <Card className="mt-4 rounded-2xl shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Role Snapshot</CardTitle>
                            <CardDescription>Core ownership</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {members.map((m) => (
                                <div key={m.id} className="rounded-xl border p-3">
                                    <div className="font-semibold">{m.name}</div>
                                    <div className="text-muted-foreground">{m.role}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </aside>

                <main className="p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{menu.find((m) => m.id === active)?.label || "Home"}</h1>
                            <p className="text-sm text-muted-foreground">Clean household operations without the chaos.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative w-full md:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search library or scan the hub..." className="rounded-2xl pl-10" />
                            </div>
                            <Button variant="outline" className="rounded-2xl"><Bell className="mr-2 h-4 w-4" />Alerts</Button>
                        </div>
                    </div>

                    {active === "home" && (
                        <div className="mt-6 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <StatCard title="Open Tasks" value={overdueTasks} hint="Recurring + one-off" icon={CheckSquare} />
                                <StatCard title="Open Requests" value={openRequests} hint="Need follow-up" icon={ClipboardList} />
                                <StatCard title="Upcoming Events" value={dueSoon} hint="Bills, meetings, reminders" icon={CalendarDays} />
                                <StatCard title="Shopping Items" value={shoppingOpen} hint="Still need to buy" icon={ShoppingCart} />
                            </div>

                            <div className="grid gap-4 xl:grid-cols-3">
                                <Card className="rounded-2xl xl:col-span-2">
                                    <CardHeader>
                                        <CardTitle>This Week</CardTitle>
                                        <CardDescription>What is actually happening</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {tasks.slice(0, 5).map((task) => (
                                            <div key={task.id} className="flex items-center justify-between rounded-2xl border p-3">
                                                <div>
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-sm text-muted-foreground">{memberName(task.assignee)} • {task.due}</div>
                                                </div>
                                                <Badge>{task.status}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl">
                                    <CardHeader>
                                        <CardTitle>Quick Rules</CardTitle>
                                        <CardDescription>House baseline</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="rounded-xl border p-3">If it is not in Splitwise, it does not count.</div>
                                        <div className="rounded-xl border p-3">If you use the last of something, replace it.</div>
                                        <div className="rounded-xl border p-3">If you see a problem, report it early.</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {active === "wiki" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Wiki / Home Library"
                                description="Source of truth for rules, guides, contacts, and household reference docs."
                                action={
                                    <AddItemDialog
                                        triggerLabel="New Page"
                                        title="Add Wiki Page"
                                        fields={[
                                            { name: "title", label: "Title" },
                                            { name: "category", label: "Category" },
                                            { name: "content", label: "Content", type: "textarea" },
                                        ]}
                                        onSubmit={(form) => setWiki((prev) => [...prev, { id: Date.now(), ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4 lg:grid-cols-2">
                                {filteredWiki.map((page) => (
                                    <Card key={page.id} className="rounded-2xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between gap-3">
                                                <CardTitle className="text-lg">{page.title}</CardTitle>
                                                <Badge variant="secondary">{page.category}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{page.content}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "tasks" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Tasks / Maintenance"
                                description="Recurring chores, admin work, maintenance, and one-off tasks."
                                action={
                                    <AddItemDialog
                                        triggerLabel="New Task"
                                        title="Add Task"
                                        fields={[
                                            { name: "title", label: "Title" },
                                            {
                                                name: "category", label: "Category", type: "select", options: [
                                                    { value: "Chore", label: "Chore" },
                                                    { value: "Maintenance", label: "Maintenance" },
                                                    { value: "Admin", label: "Admin" },
                                                    { value: "Meals", label: "Meals" },
                                                ]
                                            },
                                            { name: "assignee", label: "Assignee", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "due", label: "Due Date", type: "date" },
                                            { name: "recurring", label: "Recurring" },
                                            {
                                                name: "priority", label: "Priority", type: "select", options: [
                                                    { value: "Low", label: "Low" },
                                                    { value: "Medium", label: "Medium" },
                                                    { value: "High", label: "High" },
                                                ]
                                            },
                                        ]}
                                        onSubmit={(form) => setTasks((prev) => [...prev, { id: Date.now(), status: "Open", ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4">
                                {tasks.map((task) => (
                                    <Card key={task.id} className="rounded-2xl">
                                        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{task.title}</h3>
                                                    <Badge variant="outline">{task.category}</Badge>
                                                    <Badge>{task.priority}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{memberName(task.assignee)} • Due {task.due} • {task.recurring || "No recurrence"}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="rounded-2xl" onClick={() => setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "Done" ? "Open" : "Done" } : t))}>
                                                    {task.status === "Done" ? "Reopen" : "Mark Done"}
                                                </Button>
                                                <Badge>{task.status}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "requests" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Requests"
                                description="Person-to-person asks for help, support, fixes, and follow-up."
                                action={
                                    <AddItemDialog
                                        triggerLabel="New Request"
                                        title="Add Request"
                                        fields={[
                                            { name: "title", label: "Title" },
                                            { name: "from", label: "From", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "to", label: "To", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "type", label: "Type" },
                                            { name: "notes", label: "Notes", type: "textarea" },
                                        ]}
                                        onSubmit={(form) => setRequests((prev) => [...prev, { id: Date.now(), status: "Open", ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4 lg:grid-cols-2">
                                {requests.map((req) => (
                                    <Card key={req.id} className="rounded-2xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between gap-2">
                                                <CardTitle className="text-lg">{req.title}</CardTitle>
                                                <Badge>{req.status}</Badge>
                                            </div>
                                            <CardDescription>{memberName(req.from)} → {memberName(req.to)} • {req.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground">{req.notes}</p>
                                            <Button variant="outline" className="rounded-2xl" onClick={() => setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: r.status === "Closed" ? "Open" : "Closed" } : r))}>
                                                {req.status === "Closed" ? "Reopen" : "Close Request"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "calendar" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Calendar"
                                description="Bills, meetings, appointments, recurring tasks, and household reminders."
                                action={
                                    <AddItemDialog
                                        triggerLabel="New Event"
                                        title="Add Calendar Event"
                                        fields={[
                                            { name: "title", label: "Title" },
                                            { name: "date", label: "Date", type: "date" },
                                            { name: "type", label: "Type" },
                                            { name: "owner", label: "Owner", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                        ]}
                                        onSubmit={(form) => setEvents((prev) => [...prev, { id: Date.now(), ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4">
                                {events.map((event) => (
                                    <Card key={event.id} className="rounded-2xl">
                                        <CardContent className="flex items-center justify-between gap-3 p-4">
                                            <div>
                                                <div className="font-semibold">{event.title}</div>
                                                <div className="text-sm text-muted-foreground">{event.date} • {event.type} • {memberName(event.owner)}</div>
                                            </div>
                                            <Badge variant="secondary">{event.type}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "meals" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Meals / Meal Prep"
                                description="Weekly meal plan, prep schedule, and cost-saving food coordination."
                                action={
                                    <AddItemDialog
                                        triggerLabel="Add Meal"
                                        title="Add Meal Plan"
                                        fields={[
                                            { name: "day", label: "Day" },
                                            { name: "meal", label: "Meal" },
                                            { name: "prepBy", label: "Prep By", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "notes", label: "Notes", type: "textarea" },
                                        ]}
                                        onSubmit={(form) => setMeals((prev) => [...prev, { id: Date.now(), ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4 lg:grid-cols-2">
                                {meals.map((meal) => (
                                    <Card key={meal.id} className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{meal.day}: {meal.meal}</CardTitle>
                                            <CardDescription>Prep by {memberName(meal.prepBy)}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{meal.notes}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "shopping" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Shopping List"
                                description="Shared groceries, supplies, pet items, and household restocks."
                                action={
                                    <AddItemDialog
                                        triggerLabel="Add Item"
                                        title="Add Shopping Item"
                                        fields={[
                                            { name: "item", label: "Item" },
                                            { name: "qty", label: "Quantity" },
                                            { name: "category", label: "Category" },
                                        ]}
                                        onSubmit={(form) => setShopping((prev) => [...prev, { id: Date.now(), checked: false, ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-3">
                                {shopping.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-2xl border p-4">
                                        <div className="flex items-center gap-3">
                                            <Checkbox checked={item.checked} onCheckedChange={() => setShopping((prev) => prev.map((s) => s.id === item.id ? { ...s, checked: !s.checked } : s))} />
                                            <div>
                                                <div className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.item}</div>
                                                <div className="text-sm text-muted-foreground">{item.qty} • {item.category}</div>
                                            </div>
                                        </div>
                                        <Badge variant={item.checked ? "secondary" : "outline"}>{item.checked ? "Done" : "Open"}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "gigi" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Pet Care"
                                description="Feeding, walks, meds, appointments, and routine care for Gigi."
                                action={
                                    <AddItemDialog
                                        triggerLabel="Add Pet Task"
                                        title="Add Pet Care Task"
                                        fields={[
                                            { name: "task", label: "Task" },
                                            { name: "assignedTo", label: "Assigned To", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "time", label: "Time", type: "time" },
                                        ]}
                                        onSubmit={(form) => setPetTasks((prev) => [...prev, { id: Date.now(), done: false, ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="rounded-2xl">
                                    <CardHeader>
                                        <CardTitle>Daily Routine</CardTitle>
                                        <CardDescription>Core repeatables</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {petTasks.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
                                                <div>
                                                    <div className="font-medium">{t.task}</div>
                                                    <div className="text-sm text-muted-foreground">{memberName(t.assignedTo)} • {t.time}</div>
                                                </div>
                                                <Button variant="outline" className="rounded-2xl" onClick={() => setPetTasks((prev) => prev.map((p) => p.id === t.id ? { ...p, done: !p.done } : p))}>
                                                    {t.done ? "Undo" : "Done"}
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="rounded-2xl">
                                    <CardHeader>
                                        <CardTitle>Care Notes</CardTitle>
                                        <CardDescription>Behavior + reminders</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                                        <div className="rounded-xl border p-3">Keep feeding times consistent.</div>
                                        <div className="rounded-xl border p-3">If Gigi gets pushy, check food, outside time, or attention first.</div>
                                        <div className="rounded-xl border p-3">Vet and medication reminders should also be mirrored on the calendar.</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {active === "vehicles" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Vehicle Scheduler"
                                description="Vehicle use, maintenance timing, and shared coordination."
                                action={
                                    <AddItemDialog
                                        triggerLabel="Book Vehicle"
                                        title="Add Vehicle Booking"
                                        fields={[
                                            { name: "vehicle", label: "Vehicle" },
                                            { name: "bookedBy", label: "Booked By", type: "select", options: members.map((m) => ({ value: m.id, label: m.name })) },
                                            { name: "date", label: "Date", type: "date" },
                                            { name: "purpose", label: "Purpose" },
                                        ]}
                                        onSubmit={(form) => setVehicles((prev) => [...prev, { id: Date.now(), status: "Planned", ...form }])}
                                    />
                                }
                            />
                            <div className="grid gap-4 lg:grid-cols-2">
                                {vehicles.map((v) => (
                                    <Card key={v.id} className="rounded-2xl">
                                        <CardHeader>
                                            <div className="flex items-center justify-between gap-2">
                                                <CardTitle className="text-lg">{v.vehicle}</CardTitle>
                                                <Badge>{v.status}</Badge>
                                            </div>
                                            <CardDescription>{v.date} • {memberName(v.bookedBy)}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{v.purpose}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {active === "members" && (
                        <div className="mt-6 space-y-6">
                            <SectionHeader
                                title="Members / Roles"
                                description="Household members, role ownership, and contact structure."
                                action={<Button className="rounded-2xl" variant="outline"><Filter className="mr-2 h-4 w-4" />Role View</Button>}
                            />
                            <div className="grid gap-4 lg:grid-cols-3">
                                {members.map((m) => (
                                    <Card key={m.id} className="rounded-2xl">
                                        <CardHeader>
                                            <CardTitle>{m.name}</CardTitle>
                                            <CardDescription>{m.role}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                                            <div className="rounded-xl border p-3">
                                                <strong className="block text-foreground">Primary lane</strong>
                                                {m.role}
                                            </div>
                                            <div className="rounded-xl border p-3">
                                                <strong className="block text-foreground">Open tasks</strong>
                                                {tasks.filter((t) => t.assignee === m.id && t.status !== "Done").length}
                                            </div>
                                            <div className="rounded-xl border p-3">
                                                <strong className="block text-foreground">Open requests</strong>
                                                {requests.filter((r) => r.to === m.id && r.status !== "Closed").length}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
