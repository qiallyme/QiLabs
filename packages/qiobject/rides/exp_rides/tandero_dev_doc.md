---
title: Tandero Zoho Creator MVP
version: 1.0
author: Cody Rice-Velasquez
date: 2025-11-02
tags: [tandero, zoho, dispatch, ai-receptionist, community-app]
slug: tandero-zoho-creator-mvp
realm: 2_QsKb
owner: CRV
privacy: private
qi_decimal: 2.99.00-01.SYS
---

# Tandero — Zoho Creator MVP

**Summary:** Tandero is a lightweight community dispatch app for booking rides by phone or form. Dispatchers (or an AI receptionist) create a booking with pickup/dropoff/time, the system assigns an available driver, texts details, and tracks status from *New → Assigned → En‑Route → Completed*. Drivers see only their own jobs; admins get “Unassigned” and “Today” views, quick status buttons, and simple reconciliation by payment method (Cash, Cash App, Zelle, Card, or Tanda Credit).

---

## Quick Setup (Creator Console)
1. Create **Forms** in this order:
   - Drivers
   - Vehicles
   - Riders
   - Bookings
2. Import the CSV templates below to pre‑fill sample data.
3. Build reports: *Today’s Dispatch*, *Unassigned*, *By Driver (Calendar)*.
4. Add basic Deluge workflows (auto‑assign, SMS notify) if desired.

---

## Data Structure & CSV Templates

### Drivers.csv
```
Full_Name,Phone,Preferred_Language,Status,Home_Zone,Max_Concurrent_Rides
Alice Garcia,3175551001,Spanish,Active,Central,1
Juan Rivera,3175551002,Spanish,Active,West,1
Mary Smith,3175551003,English,Active,East,2
```

### Vehicles.csv
```
Driver,Make_Model,Plate,Seats,Inspection_Expires
Alice Garcia,Toyota Camry,IN-ABC123,4,2026-06-30
Juan Rivera,Honda Odyssey,IN-HJK456,6,2026-05-31
```

### Riders.csv
```
Full_Name,Phone,Language
Blanca Valverde,3175552001,Spanish
Ramon Valverde,3175552002,Spanish
Luis Palacios,3175552003,Spanish
```

### Bookings.csv
```
Rider,Pickup_Address,Dropoff_Address,Pickup_Time,Passengers,Payment_Method,Dispatch_Priority,Status,Assigned_Driver,Source,Notes
Blanca Valverde,"123 Main St, Indianapolis","Clinic, 200 Health Way",2025-11-02 14:00,1,Cash,Normal,Assigned,Alice Garcia,Phone Call,Wheelchair ramp needed
Ramon Valverde,"456 Park Ave, Indianapolis","DMV, 300 State St",2025-11-02 15:30,2,Zelle,High,Assigned,Juan Rivera,WhatsApp,Spanish speaker preferred
Luis Palacios,"789 Oak St, Indianapolis","Supermarket, 12 Market Rd",2025-11-02 16:15,1,Cash App,Normal,New,,Web Form,Ok with carpool
```

---

## Form Fields Summary

**Drivers:** Full_Name, Phone, Preferred_Language, Status, Home_Zone, Max_Concurrent_Rides  
**Vehicles:** Driver *(Lookup → Drivers.Full_Name)*, Make_Model, Plate, Seats, Inspection_Expires  
**Riders:** Full_Name, Phone, Language  
**Bookings:** Rider *(Lookup → Riders.Full_Name)*, Pickup_Address, Dropoff_Address, Pickup_Time, Passengers, Payment_Method *(Cash/Cash App/Zelle/Card/Tanda Credit)*, Dispatch_Priority *(Normal/High/Critical)*, Status *(New/Assigned/En‑Route/Completed/Canceled)*, Assigned_Driver *(Lookup → Drivers.Full_Name)*, Source *(Phone Call/WhatsApp/Web Form/AI/Walk‑in)*, Notes  

---

## Recommended Reports
- **Today’s Dispatch (Kanban)** — grouped by Status
- **Unassigned (Table)** — filter `Assigned_Driver is Empty`
- **By Driver (Calendar)** — group by Pickup_Time

---

## Optional Workflows (Deluge Snippets)

### Auto‑Assign Driver (Round‑Robin)
```deluge
if(input.Assigned_Driver == null)
{
    active_list = Drivers[Status == "Active"].getAll();
    min_count = 9999;
    best_driver = null;
    for each d in active_list
    {
        count = Bookings[Assigned_Driver == d.ID && (Status == "Assigned" || Status == "En‑Route") && Pickup_Time.toDate() == zoho.currentdate].count();
        if(count < min_count)
        {
            min_count = count;
            best_driver = d;
        }
    }
    if(best_driver != null)
    {
        input.Assigned_Driver = best_driver.ID;
        input.Status = "Assigned";
    }
    else
    {
        input.Status = "Queued";
    }
}
```

### Notify Driver via Webhook
```deluge
if(input.Assigned_Driver != null)
{
    d = Drivers[ID == input.Assigned_Driver];
    msg = "New Ride " + input.booking_id + " — " + input.Pickup_Time.toString("MMM d, hh:mm a") + "\n" +
          "Pickup: " + input.Pickup_Address.address_line1 + "\n" +
          "Dropoff: " + input.Dropoff_Address.address_line1 + "\n" +
          "Rider: " + Riders[ID == input.Rider].Full_Name;

    response = invokeurl
    [
        url : "https://hooks.yourdomain.tld/notify/driver"
        type : POST
        parameters: {"to": d.Phone.toString(), "message": msg}
        timeout : 10
    ];
}
```

---

## Go‑Live Checklist
- [ ] Forms created and lookups linked correctly
- [ ] Sample CSV data imported successfully
- [ ] Reports configured (Kanban, Table, Calendar)
- [ ] Optional workflows tested and enabled
- [ ] Public booking form or AI webhook configured (optional)

---

**Saved for re‑deployment or iteration in future Zoho Creator builds.**

