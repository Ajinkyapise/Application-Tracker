import React, { useEffect, useState } from "react";
import RecruiterCell from "./RecruiterCell";
import {
  getLinkedinEntries,
  addLinkedinEntry,
  updateLinkedinEntry,
  deleteLinkedinEntry
} from "../../firebase-config";
import "./linkedinTracker.css";

/* ---------------- HELPERS ---------------- */

function daysElapsed(date) {
  const start = new Date(date);
  const today = new Date();
  return Math.max(
    Math.floor((today - start) / (1000 * 60 * 60 * 24)),
    0
  );
}

function shouldAutoIgnore(row) {
  const days = daysElapsed(row.appliedDate);
  const pendingStatuses = [
    "Applied on LinkedIn",
    "Applied on Mail"
  ];

  return days > 10 && pendingStatuses.includes(row.status);
}

/* ---------------- DEFAULT FORM ---------------- */

const EMPTY_FORM = {
  recruiter: {
    linkedin: ""
  },
  postUrl: "",
  status: "Applied on LinkedIn",
  appliedDate: new Date().toISOString().split("T")[0]
};

/* ---------------- PAGE ---------------- */

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

    // Auto mark ignored after 10 days
    for (const row of data) {
      if (shouldAutoIgnore(row)) {
        await updateLinkedinEntry(user.uid, row.id, {
          status: "Ignored"
        });
      }
    }

    const refreshed = await getLinkedinEntries(user.uid);
    setRows(refreshed);
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
    if (!form.postUrl) {
      alert("LinkedIn job post URL is required");
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

  /* ---------------- DELETE ---------------- */

  async function remove(id) {
    if (!window.confirm("Delete this entry?")) return;
    await deleteLinkedinEntry(user.uid, id);
    load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* HEADER */}
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
              <th className="p-3 text-left">Recruiter</th>
              <th className="p-3 text-left">Job Post</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(row => (
              <tr
                key={row.id}
                className={`border-t hover:bg-gray-50 ${
                  row.status === "Ignored" ? "opacity-50" : ""
                }`}
              >
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

                <td className="p-3 font-medium">{row.status}</td>

                <td className="p-3 text-center space-x-3">
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
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No applications yet 🚀
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editingRow ? "✏️ Edit Application" : "➕ Add Application"}
            </h2>

            <div className="grid gap-3">
              {/* Recruiter LinkedIn */}
              <div>
                <label className="label">Recruiter LinkedIn</label>
                <input
                  className="input"
                  placeholder="https://linkedin.com/in/..."
                  value={form.recruiter.linkedin}
                  onChange={e =>
                    setForm({
                      ...form,
                      recruiter: { linkedin: e.target.value }
                    })
                  }
                />
              </div>

              {/* Job Post */}
              <div>
                <label className="label">Job Post URL *</label>
                <input
                  className="input"
                  placeholder="https://linkedin.com/jobs/..."
                  value={form.postUrl}
                  onChange={e =>
                    setForm({ ...form, postUrl: e.target.value })
                  }
                />
              </div>

              {/* Status + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={e =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Applied on LinkedIn</option>
                    <option>Applied on Mail</option>
                    <option>Got Reply</option>
                    <option>Rejected</option>
                    <option>Ignored</option>
                  </select>
                </div>

                <div>
                  <label className="label">Applied Date</label>
                  <input
                    type="date"
                    className="input"
                    value={form.appliedDate}
                    onChange={e =>
                      setForm({
                        ...form,
                        appliedDate: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="modal-actions mt-5">
              <button className="btn" onClick={saveForm}>
                💾 Save
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
