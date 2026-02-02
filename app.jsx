import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, Plus, Users } from "lucide-react";

// This version supports:
// - Public signup mode for customers
// - Admin approval queue
// - Route manager for iPhone use

export default function App() {
  const [mode, setMode] = useState("public"); // public or admin
  const [customers, setCustomers] = useState([]);
  const [pending, setPending] = useState([]);
  const [view, setView] = useState("routes");
  const [completed, setCompleted] = useState([]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    binSize: "55 Gallon",
    schedule: "Weekly",
    notes: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("828-customers");
    const wait = localStorage.getItem("828-pending");
    const done = localStorage.getItem("828-completed");

    if (saved) setCustomers(JSON.parse(saved));
    if (wait) setPending(JSON.parse(wait));
    if (done) setCompleted(JSON.parse(done));
  }, []);

  useEffect(() => {
    localStorage.setItem("828-customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("828-pending", JSON.stringify(pending));
  }, [pending]);

  useEffect(() => {
    localStorage.setItem("828-completed", JSON.stringify(completed));
  }, [completed]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Public customer request
  const handlePublicSubmit = (e) => {
    e.preventDefault();
    setPending([...pending, { ...form, id: Date.now() }]);
    setForm({
      name: "",
      address: "",
      phone: "",
      binSize: "55 Gallon",
      schedule: "Weekly",
      notes: ""
    });
    alert("Request sent to 828 Convenient Recycling!");
  };

  // Admin adds directly
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setCustomers([...customers, { ...form, id: Date.now() }]);
    setView("routes");
    setForm({
      name: "",
      address: "",
      phone: "",
      binSize: "55 Gallon",
      schedule: "Weekly",
      notes: ""
    });
  };

  const approveCustomer = (id) => {
    const c = pending.find((p) => p.id === id);
    setCustomers([...customers, c]);
    setPending(pending.filter((p) => p.id !== id));
  };

  const openMap = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  const toggleComplete = (id) => {
    setCompleted(
      completed.includes(id)
        ? completed.filter((c) => c !== id)
        : [...completed, id]
    );
  };

  const grouped = {
    Weekly: customers.filter((c) => c.schedule === "Weekly"),
    "Bi-Weekly": customers.filter((c) => c.schedule === "Bi-Weekly"),
    Monthly: customers.filter((c) => c.schedule === "Monthly"),
    "On Call": customers.filter((c) => c.schedule === "On Call")
  };

  const CustomerCard = ({ c }) => (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm">{c.address}</div>
            <div className="text-sm">{c.binSize}</div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => openMap(c.address)}>
              <MapPin className="w-4 h-4" />
            </Button>

            <Button size="sm" onClick={() => toggleComplete(c.id)}>
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {c.notes && <div className="text-xs mt-1">Notes: {c.notes}</div>}

        {completed.includes(c.id) && (
          <div className="text-xs mt-1 font-semibold">Pickup Completed</div>
        )}
      </CardContent>
    </Card>
  );

  const SignupForm = ({ onSubmit, title }) => (
    <div className="space-y-3">
      <h2 className="font-semibold">{title}</h2>

      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        name="address"
        placeholder="Service Address"
        value={form.address}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <select
        name="binSize"
        value={form.binSize}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option>32 Gallon</option>
        <option>55 Gallon</option>
        <option>96 Gallon</option>
        <option>Brewery / Commercial</option>
      </select>

      <select
        name="schedule"
        value={form.schedule}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option>Weekly</option>
        <option>Bi-Weekly</option>
        <option>Monthly</option>
        <option>On Call</option>
      </select>

      <textarea
        name="notes"
        placeholder="Gate code / where to leave bin"
        value={form.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <Button className="w-full" onClick={onSubmit}>
        Submit Request
      </Button>
    </div>
  );

  const AdminPending = () => (
    <div>
      <h2 className="font-semibold mb-2">New Requests</h2>

      {pending.length === 0 && <div>No new requests</div>}

      {pending.map((c) => (
        <Card key={c.id} className="mb-2">
          <CardContent className="p-3">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm">{c.address}</div>
            <div className="text-sm mb-1">{c.schedule}</div>

            <Button size="sm" onClick={() => approveCustomer(c.id)}>
              Approve Customer
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const RoutesView = () => (
    <div>
      {Object.keys(grouped).map((key) => (
        <div key={key} className="mb-4">
          <div className="font-bold mb-2">{key} Route</div>
          {grouped[key].length === 0 && (
            <div className="text-sm">No customers</div>
          )}
          {grouped[key].map((c) => (
            <CustomerCard key={c.id} c={c} />
          ))}
        </div>
      ))}
    </div>
  );

  // PUBLIC CUSTOMER PAGE
  if (mode === "public") {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-1">828 Convenient Recycling</h1>
        <div className="text-sm mb-3">
          Free aluminum can pickup in the 828 area
        </div>

        <SignupForm
          title="Request Your Free Bin"
          onSubmit={handlePublicSubmit}
        />

        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setMode("admin")}>
            Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // ADMIN SIDE
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">828 Convenient Recycling - Admin</h1>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button onClick={() => setView("routes")}>Routes</Button>
        <Button onClick={() => setView("add")}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
        <Button onClick={() => setView("pending")}>
          <Users className="w-4 h-4 mr-1" /> Requests
        </Button>
      </div>

      {view === "routes" && <RoutesView />}
      {view === "add" && (
        <SignupForm title="Add Customer" onSubmit={handleAdminSubmit} />
      )}
      {view === "pending" && <AdminPending />}

      <div className="mt-4">
        <Button variant="outline" onClick={() => setMode("public")}>
          Switch to Public Page
        </Button>
      </div>
    </div>
  );
}
