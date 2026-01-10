import React, { useEffect, useState } from "react";
import RecruiterCell from "./RecruiterCell";
import {
  getLinkedinEntries,
  addLinkedinEntry,
  updateLinkedinEntry,
  deleteLinkedinEntry
} from "../../firebase-config";
import "./linkedinTracker.css";

function daysElapsed(date) {
  const start = new Date(date);
  const today = new Date();
  return Math.max(
    Math.floor((today - start) / (1000 * 60 * 60 * 24)),
    0
  );
}

const EMPTY_FORM = {
  recruiter: {
    name: "",
    phone: "",
    email: "",
    linkedin: ""
  },
  postUrl: "",
  status: "Applied",
  appliedDate: new Date().toISOString().split("T")[0],
  followedUp: false
};

export default function LinkedinTrackerPage({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* ---------------- LOAD DATA ---------------- */
  async function load() {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getLinkedinEntries(user.uid);
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  /* ---------------- OPEN FORM ---------------- */
  function openAddForm() {
    setEditingRow(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(row) {
    setEditingRow(row);
    setForm(row);
    setShowForm(true);
  }

  /* ---------------- SAVE ---------------- */
  async function saveForm() {
    if (!form.recruiter.name || !form.postUrl) {
      alert("Recruiter name and LinkedIn post are required");
      return;
    }

    if (editingRow) {
      await updateLinkedinEntry(user.uid, editingRow.id, form);
    } else {
      await addLinkedinEntry(user.uid, form);
    }

    setShowForm(false);
    setEditingRow(null);
    setForm(EMPTY_FORM);
    load();
  }

  /* ---------------- TOGGLE FOLLOW UP ---------------- */
  async function toggleFollowUp(row) {
    await updateLinkedinEntry(user.uid, row.id, {
      followedUp: !row.followedUp
    });
    load();
  }

  /* ---------------- DELETE ---------------- */
  async function remove(id) {
    if (!window.confirm("Delete this entry?")) return;
    await deleteLinkedinEntry(user.uid, id);
    load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">
          📌 LinkedIn Applications Tracker
        </h1>

        <button
          onClick={openAddForm}
          className="px-3 py-2 bg-black text-white rounded"
        >
          ➕ Add New
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Recruiter Contact</th>
              <th className="p-3 text-left">LinkedIn Post</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Days Elapsed</th>
              <th className="p-3 text-center">Followed Up</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-t">
                <td className="p-3">
                  <RecruiterCell recruiter={row.recruiter} />
                </td>

                <td className="p-3">
                  <a
                    href={row.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Post
                  </a>
                </td>

                <td className="p-3">{row.status}</td>

                <td className="p-3 text-center">
                  {daysElapsed(row.appliedDate)} days
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleFollowUp(row)}
                    className="text-lg"
                  >
                    {row.followedUp ? "✅" : "❌"}
                  </button>
                </td>

                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => openEditForm(row)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => remove(row.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No applications yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="mb-3 font-semibold">
              {editingRow ? "Edit Entry" : "Add New Entry"}
            </h2>

            <input
              placeholder="Recruiter Name"
              value={form.recruiter.name}
              onChange={e =>
                setForm({
                  ...form,
                  recruiter: { ...form.recruiter, name: e.target.value }
                })
              }
            />

            <input
              placeholder="Phone"
              value={form.recruiter.phone}
              onChange={e =>
                setForm({
                  ...form,
                  recruiter: { ...form.recruiter, phone: e.target.value }
                })
              }
            />

            <input
              placeholder="Email"
              value={form.recruiter.email}
              onChange={e =>
                setForm({
                  ...form,
                  recruiter: { ...form.recruiter, email: e.target.value }
                })
              }
            />

            <input
              placeholder="Recruiter LinkedIn URL"
              value={form.recruiter.linkedin}
              onChange={e =>
                setForm({
                  ...form,
                  recruiter: { ...form.recruiter, linkedin: e.target.value }
                })
              }
            />

            <input
              placeholder="LinkedIn Job Post URL"
              value={form.postUrl}
              onChange={e => setForm({ ...form, postUrl: e.target.value })}
            />

            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Reached Out</option>
              <option>Rejected</option>
            </select>

            <input
              type="date"
              value={form.appliedDate}
              onChange={e =>
                setForm({ ...form, appliedDate: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn" onClick={saveForm}>
                Save
              </button>

              <button
                className="linkedin-btn-danger"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
