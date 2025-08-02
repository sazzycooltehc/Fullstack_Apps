"use client";

import { useEffect, useState } from "react";
import { getResultData, IncidentData } from "@/utils/resultStore";

function IncidentResults() {
  const [data, setData] = useState<IncidentData[]>([]);

  useEffect(() => {
    const result = getResultData();
    if (Array.isArray(result)) {
      setData(result);
    }
  }, []);

  if (data.length === 0) {
    return <div className="p-4 text-gray-600">No data available. Please submit the form first.</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submitted Issues</h1>
      <div className="overflow-auto rounded-2xl shadow-md bg-white">
        <table className="min-w-full border border-gray-300 text-sm bg-white">
          <thead className="bg-gray-200">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border px-4 py-3 text-left font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {headers.map((h) => (
                  <td key={h} className="border px-4 py-2 text-gray-800">
                    {row[h as keyof IncidentData]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncidentResults;
