import React from "react";

export default function RecruiterCell({ recruiter }) {
  if (!recruiter) return null;

  return (
    <div className="space-y-1">
      <div className="font-semibold">{recruiter.name}</div>

      {recruiter.phone && (
        <a
          href={`tel:${recruiter.phone}`}
          className="block text-xs text-gray-600 hover:underline"
        >
          📞 {recruiter.phone}
        </a>
      )}

      {recruiter.email && (
        <a
          href={`mailto:${recruiter.email}`}
          className="block text-xs text-gray-600 hover:underline"
        >
          ✉️ {recruiter.email}
        </a>
      )}

      {recruiter.linkedin && (
        <a
          href={recruiter.linkedin}
          target="_blank"
          rel="noreferrer"
          className="block text-xs text-blue-600 hover:underline"
        >
          🔗 LinkedIn Profile
        </a>
      )}
    </div>
  );
}
