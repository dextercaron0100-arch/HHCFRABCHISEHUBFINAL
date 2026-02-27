import { createRoot } from "react-dom/client";
import "./siomai-inquiry.css";
import FranchiseInquiryPreview from "./FranchiseInquiryPreview.jsx";

const mountNode = document.getElementById("siomaiInquiryMount");

if (mountNode) {
  createRoot(mountNode).render(<FranchiseInquiryPreview />);
}
