import React from "react";

const EvidenceUpload = () => (
  <form>
    <input type="file" accept="image/*" />
    <button type="submit">Upload Photo Evidence</button>
  </form>
);

export default EvidenceUpload;