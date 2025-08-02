export interface IncidentData {
  issue_id: string;
  desc: string;
  "Issue Description": string;
  "Issue Category": string;
  "Issue Subcategory": string;
  "Root Cause Analysis": string;
  "Resolution": string;
  "Resolved By": string;
}

let resultData: IncidentData[] | null = null;

export const setResultData = (data: IncidentData[]) => {
  resultData = data;
};

export const getResultData = (): IncidentData[] | null => {
  return resultData;
};
