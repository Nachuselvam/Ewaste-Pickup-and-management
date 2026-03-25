import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificatePreview = () => {
  // ✅ Get user from localStorage
  const storedUser = localStorage.getItem("user");
  let name = "User";
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      if (userObj.name) name = userObj.name;
    } catch (err) {
      console.error("Error parsing user:", err);
    }
  }

  const handleDownload = () => {
    const input = document.getElementById("certificate");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("certificate.pdf");
    });
  };

  return (
    <div className="certificate-preview-container">
      <div id="certificate" className="certificate-card">
        <div className="certificate-border">
          <h1 className="certificate-title">Certificate of Contribution</h1>
          <p className="certificate-subtitle">This certificate is proudly presented to</p>
          <h2 className="certificate-name">{name}</h2>
          <p className="certificate-body">
            In recognition of your outstanding contribution in submitting 5+ e-waste requests 
            and helping create a cleaner, greener planet.
          </p>
          <div className="certificate-footer">
            <div className="signature">♻️ E-Waste Management Team</div>
            <div className="date">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <button className="download-btn" onClick={handleDownload}>
        ⬇️ Download Certificate
      </button>
    </div>
  );
};

export default CertificatePreview;
